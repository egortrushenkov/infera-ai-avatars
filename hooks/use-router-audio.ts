"use client";

import { useCallback, useRef, useState } from "react";

const SAMPLE_RATE = 24000;

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function playPcm16(pcmBytes: Uint8Array, sampleRate: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const numSamples = pcmBytes.length / 2;
    const buffer = ctx.createBuffer(1, numSamples, sampleRate);
    const channel = buffer.getChannelData(0);
    const view = new DataView(pcmBytes.buffer, pcmBytes.byteOffset, pcmBytes.byteLength);
    for (let i = 0; i < numSamples; i++) {
      channel[i] = view.getInt16(i * 2, true) / 32768;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      ctx.close();
      resolve();
    };
    source.start(0);
  });
}

async function parseSSEAudioStream(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<Uint8Array> {
  const decoder = new TextDecoder();
  let buffer = "";
  const pcmChunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") continue;
      try {
        const json = JSON.parse(data) as { choices?: Array<{ delta?: { audio?: { data?: string } } }> };
        const audioB64 = json.choices?.[0]?.delta?.audio?.data;
        if (audioB64) pcmChunks.push(base64ToUint8Array(audioB64));
      } catch {
        // skip invalid JSON
      }
    }
  }

  const total = pcmChunks.reduce((acc, c) => acc + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of pcmChunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

export function useRouterAudio() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (typeof window === "undefined" || !text?.trim()) return;
    stop();

    const controller = new AbortController();
    abortRef.current = controller;

    setIsSpeaking(true);
    try {
      const res = await fetch("/api/chat/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error("Audio request failed");
      const reader = res.body.getReader();
      const pcmBytes = await parseSSEAudioStream(reader);
      if (pcmBytes.length === 0) throw new Error("No audio data");
      if (abortRef.current !== controller) return;
      await playPcm16(pcmBytes, SAMPLE_RATE);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      console.error("Router audio error:", e);
      throw e;
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsSpeaking(false);
    }
  }, [stop]);

  return { speak, stop, isSpeaking };
}
