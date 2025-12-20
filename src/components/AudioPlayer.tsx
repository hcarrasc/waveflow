import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { parseBlob } from 'music-metadata';
import music_placeholder from '../assets/music_placeholder.png';

export function AudioPlayer({ audioFile }: { audioFile: File | null }) {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);

    const [metadata, setMetadata] = useState<{ title?: string; artist?: string; album?: string }>(
        {},
    );
    const [cover, setCover] = useState<string | null>(null);

    const handlePlayPause = () => {
        wavesurferRef.current?.playPause();
    };

    useEffect(() => {
        if (!audioFile) return;

        let coverUrl: string | null = null;

        (async () => {
            const metadata = await parseBlob(audioFile);
            const tags = metadata.common;
            const picture = tags.picture?.[0];
            if (picture) {
                coverUrl = URL.createObjectURL(
                    new Blob([picture.data as BufferSource], { type: picture.format }),
                );
            }
            setCover(coverUrl);
            setMetadata({
                title: tags.title,
                artist: tags.artist,
                album: tags.album,
            });
            handlePlayPause();
        })();

        return () => {
            if (coverUrl) {
                URL.revokeObjectURL(coverUrl);
            }
        };
    }, [audioFile]);

    useEffect(() => {
        if (!audioFile || !waveformRef.current) return;

        const ws = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#9398d8ff',
            progressColor: '#2563eb',
            cursorColor: '#111827',
            height: 50,
        });
        wavesurferRef.current = ws;

        const url = URL.createObjectURL(audioFile);
        ws.load(url);

        return () => {
            ws.destroy();
            URL.revokeObjectURL(url);
        };
    }, [audioFile]);

    return (
        <section className="audio-player">
            <div className="cover-container">
                {cover ? (
                    <img src={cover} alt="Cover" />
                ) : (
                    <img src={music_placeholder} alt="Placeholder" />
                )}
            </div>
            <div className="controls-container">
                <h3>
                    {metadata.artist || 'Artista desconocido'} -{' '}
                    {metadata.title || 'Título desconocido'}
                </h3>
                <div ref={waveformRef} />
                <button onClick={handlePlayPause}>Play / Pause</button>
            </div>
        </section>
    );
}
