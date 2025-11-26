# generate_music_transformers.py
import argparse
import os
import torch
import scipy
from transformers import AutoProcessor, MusicgenForConditionalGeneration

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--prompt", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--max_tokens", type=int, default=256)
    args = parser.parse_args()

    prompt = args.prompt
    out_path = args.out

    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    print("Loading MusicGen-small on CPU...")
    processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
    model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")

    inputs = processor(
        text=[prompt],
        padding=True,
        return_tensors="pt"
    )

    print("Generating audio...")
    audio_values = model.generate(
        **inputs,
        max_new_tokens=args.max_tokens
    )

    sampling_rate = model.config.audio_encoder.sampling_rate
    wav = audio_values[0, 0].numpy()

    scipy.io.wavfile.write(out_path, rate=sampling_rate, data=wav)

    print("Saved:", out_path)

if __name__ == "__main__":
    main()
