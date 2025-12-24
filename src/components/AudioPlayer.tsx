import { useCallback, useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { parseBlob } from 'music-metadata';
import { type AudioFile } from '../types/metadata.ts';
import music_placeholder from '../assets/music_placeholder.png';
import play from '../assets/play.png';
import back from '../assets/back.png';
import next from '../assets/next.png';
import pause from '../assets/pause.png';
import loop from '../assets/loop.png';
import music_folder from '../assets/music_folder.png';

interface AudioPlayerProps {
    audioFile: File | null;
    setConfigsModalOpen: (open: boolean) => void;
    audioFiles?: AudioFile[];
    audioFilesIndex?: number;
    setSelectedAudioFile?: (file: File) => void;
}

export function AudioPlayer({
    audioFile,
    setConfigsModalOpen,
    audioFiles,
    setSelectedAudioFile,
    audioFilesIndex,
}: AudioPlayerProps) {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);

    const [metadata, setMetadata] = useState<{ title?: string; artist?: string; album?: string }>(
        {},
    );
    const [cover, setCover] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [loopAudioFile, setLoopAudioFile] = useState(false);

    const handlePlayPause = useCallback(() => {
        wavesurfer.current?.playPause();
        setIsPlaying((prev) => !prev);
    }, []);

    const handleLoop = () => {
        if (wavesurfer.current) {
            if (loopAudioFile) {
                wavesurfer.current.getMediaElement().loop = false;
                setLoopAudioFile(false);
            } else {
                wavesurfer.current.getMediaElement().loop = true;
                setLoopAudioFile(true);
            }
        }
    };

    const handleBack = () => {
        if (!audioFiles || audioFilesIndex === undefined || !setSelectedAudioFile) return;
        const prevFile = audioFiles?.[audioFilesIndex - 1]?.file;
        if (prevFile) {
            setSelectedAudioFile(prevFile);
        }
    };

    const handleNext = () => {
        if (!audioFiles || audioFilesIndex === undefined || !setSelectedAudioFile) return;
        const nextFile = audioFiles?.[audioFilesIndex + 1]?.file;
        if (nextFile) {
            setSelectedAudioFile(nextFile);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    }, [audioFile, handlePlayPause]);

    useEffect(() => {
        if (!audioFile || !waveformRef.current) return;

        const ws = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#3d3d3e',
            progressColor: '#2563eb',
            cursorColor: '#ffffffff',
            height: 60,
            barWidth: 3,
            barGap: 1,
            barRadius: 2,
            cursorWidth: 3,
        });
        wavesurfer.current = ws;

        const url = URL.createObjectURL(audioFile);
        ws.load(url);
        wavesurfer.current.on('ready', () => {
            setTotalTime(ws.getDuration());
        });
        wavesurfer.current.on('audioprocess', (time) => {
            setCurrentTime(time);
        });
        wavesurfer.current.on('finish', () => {
            setIsPlaying(false);
            const nextFile = audioFiles?.[audioFilesIndex! + 1]?.file;
            if (nextFile && setSelectedAudioFile) {
                setSelectedAudioFile(nextFile);
            }
        });

        return () => {
            ws.destroy();
            URL.revokeObjectURL(url);
            setIsPlaying(false);
        };
    }, [audioFile, audioFiles, audioFilesIndex, setSelectedAudioFile]);

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
                {!audioFile ? (
                    <div className="controls-container"></div>
                ) : (
                    <>
                        <h3>
                            {metadata.artist && metadata.title
                                ? `${metadata.artist} - ${metadata.title}`
                                : audioFile?.name}
                        </h3>
                        <div className="controls-container">
                            <button onClick={handleBack} className="btn-control">
                                <img src={back} alt="Back" />
                            </button>

                            <button onClick={handlePlayPause} className="btn-control">
                                <img src={isPlaying ? pause : play} alt="Play/Pause" />
                            </button>

                            <button onClick={handleNext} className="btn-control">
                                <img src={next} alt="Next" />
                            </button>

                            <button
                                onClick={handleLoop}
                                className={`btn-control ${loopAudioFile ? 'active' : ''}`}
                            >
                                <img src={loop} alt="Loop" />
                            </button>

                            <button
                                onClick={() => setConfigsModalOpen(true)}
                                className="btn-control"
                            >
                                <img src={music_folder} alt="Music Folder" />
                            </button>
                        </div>
                        <div className="time-container">
                            <div className="time">{formatTime(currentTime)}</div>
                            <div className="waveform" ref={waveformRef} />
                            <div className="time">{formatTime(totalTime)}</div>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
