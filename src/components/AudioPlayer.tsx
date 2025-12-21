import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { parseBlob } from 'music-metadata';
import music_placeholder from '../assets/music_placeholder.png';
import play from '../assets/play.png';
import back from '../assets/back.png';
import next from '../assets/next.png';
import pause from '../assets/pause.png';

export function AudioPlayer({ audioFile }: { audioFile: File | null }) {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);

    const [metadata, setMetadata] = useState<{ title?: string; artist?: string; album?: string }>(
        {},
    );
    const [cover, setCover] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlayPause = () => {
        wavesurferRef.current?.playPause();
        setIsPlaying(!isPlaying);
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
            waveColor: '#979effff',
            progressColor: '#2563eb',
            cursorColor: '#ffffffff',
            height: 60,
        });
        wavesurferRef.current = ws;

        const url = URL.createObjectURL(audioFile);
        ws.load(url);

        return () => {
            ws.destroy();
            URL.revokeObjectURL(url);
        };
    }, [audioFile]);

    useEffect(() => {
        const ws = wavesurferRef.current;
        if (!ws) return;

        const handleFinish = () => {
            ws.pause();
        };

        ws.on('finish', handleFinish);

        return () => {
            ws.un('finish', handleFinish);
        };
    }, []);

    return (
        <section className="audio-player">
            <div className="cover-container">
                {cover ? (
                    <img src={cover} alt="Cover" />
                ) : (
                    <img src={music_placeholder} alt="Placeholder" />
                )}
            </div>
            <div className="metadata-container">
                <h3>
                    {metadata.artist && metadata.title
                        ? `${metadata.artist} - ${metadata.title}`
                        : audioFile?.name}
                </h3>
                <div ref={waveformRef} />
                <div className="controls-container">
                    <button onClick={handlePlayPause} className="btn-control">
                        <img src={back} alt="Back" />
                    </button>
                    <button onClick={handlePlayPause} className="btn-control">
                        <img src={isPlaying ? pause : play} alt="Play/Pause" />
                    </button>
                    <button onClick={handlePlayPause} className="btn-control">
                        <img src={next} alt="Next" />
                    </button>
                </div>
            </div>
        </section>
    );
}
