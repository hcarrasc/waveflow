import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { parseBlob } from 'music-metadata';

export const AudioPlayer = () => {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);

    const [metadata, setMetadata] = useState<{ title?: string; artist?: string; album?: string }>({});
    const [cover, setCover] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!audioUrl || !waveformRef.current) return;

        wavesurferRef.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#9398d8ff',
            progressColor: '#2563eb',
            cursorColor: '#111827',
            height: 50,
        });

        wavesurferRef.current.load(audioUrl);

        return () => {
            wavesurferRef.current?.destroy();
        };
    }, [audioUrl]);

    interface Picture {
        data: number[];
        format: string;
    }

    interface Tags {
        title?: string;
        artist?: string;
        album?: string;
        picture?: Picture;
    }

    interface TagData {
        tags: Tags;
    }

    const handleFile = async (file: File) => {
        // URL del audio
        const url = URL.createObjectURL(file);
        setAudioUrl(url);

        const metadata = await parseBlob(file);
        const tags = metadata.common;
        console.log(tags);

        let coverUrl = null;

        if (tags.picture && tags.picture.length > 0) {
            const picture = tags.picture[0];
            coverUrl = URL.createObjectURL(new Blob([picture.data as BufferSource], { type: picture.format }));
        }
        setCover(coverUrl);
        setMetadata({
            title: tags.title,
            artist: tags.artist,
            album: tags.album,
        });
    };

    const handlePlayPause = () => {
        wavesurferRef.current?.playPause();
    };

    return (
        <div style={{ maxWidth: 400 }}>
            <input type="file" accept="audio/mp3" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />

            {cover && <img src={cover} alt="Cover" style={{ width: '100%', marginTop: 10 }} />}

            <h3>
                {metadata.title || 'Título desconocido'} - {metadata.artist || 'Artista desconocido'}
            </h3>

            <div ref={waveformRef} />

            <button onClick={handlePlayPause}>Play / Pause</button>
        </div>
    );
};
