// src/components/Attendance.js (FINAL: WITH PHOTO EVIDENCE & FORMDATA)

import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { 
    Smile, 
    ArrowLeft, 
    ArrowRight, 
    CheckCircle, 
    AlertTriangle, 
    Camera,
    Loader,
    ScanFace,
    Play
} from 'lucide-react'; 
import styles from './Attendance.module.css';

const CHALLENGES = [
    { type: 'smile', text: 'Senyum', icon: <Smile size={48} className="text-yellow-500" /> },
    { type: 'turn_right', text: 'Tengok Kanan', icon: <ArrowRight size={48} className="text-blue-500" /> },
    { type: 'turn_left', text: 'Tengok Kiri', icon: <ArrowLeft size={48} className="text-blue-500" /> }
];

const Attendance = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    
    // --- REFS ---
    const stepRef = useRef(0);
    const processingRef = useRef(false);
    const intervalRef = useRef(null);
    
    // --- STATE ---
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState('');
    
    const [challengeQueue, setChallengeQueue] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [debugInfo, setDebugInfo] = useState('Menunggu...');

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // 1. Cleanup
    const stopCameraAndLoop = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }, []);

    // 2. Start Session
    const startSession = useCallback(() => {
        stepRef.current = 0;
        processingRef.current = false;
        setCurrentStep(0);
        setIsProcessing(false);
        setFaceDetected(false);
        setDebugInfo('Menginisialisasi...');
        
        const shuffled = [...CHALLENGES].sort(() => 0.5 - Math.random());
        setChallengeQueue(shuffled.slice(0, 3));

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                    startVideo();
                },
                (err) => {
                    setLocationError('GPS Error');
                    Swal.fire('GPS Diperlukan', 'Mohon aktifkan lokasi Anda.', 'error');
                }
            );
        } else {
            Swal.fire('Error', 'Browser tidak mendukung Geolocation', 'error');
        }
    }, []);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
            .catch(err => {
                console.error(err);
                Swal.fire('Kamera Error', 'Gagal mengakses kamera.', 'error');
            });
    };

    // 3. Load Models
    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models'; 
            try {
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                ]);
                setModelsLoaded(true);
            } catch (err) {
                Swal.fire('System Error', 'Gagal memuat AI Models', 'error');
            }
        };
        loadModels();
        return () => stopCameraAndLoop();
    }, [stopCameraAndLoop]);

    useEffect(() => {
        if (modelsLoaded && isSessionActive) {
            startSession();
        }
    }, [modelsLoaded, isSessionActive, startSession]);

    // 4. Capture Snapshot (FUNGSI BARU)
    const getSnapshot = () => {
        if (!videoRef.current) return null;
        
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Gambar frame video ke canvas sementara
        const ctx = canvas.getContext('2d');
        // Flip horizontal agar sesuai tampilan mirror pengguna
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        
        // Konversi ke Blob (File)
        return new Promise(resolve => {
            canvas.toBlob(blob => {
                resolve(blob);
            }, 'image/jpeg', 0.8); // Kualitas 80%
        });
    };

    // 5. Logic Deteksi
    const checkHeadPose = (landmarks) => {
        const nose = landmarks.getNose()[3];
        const leftJaw = landmarks.getJawOutline()[0];
        const rightJaw = landmarks.getJawOutline()[16];
        const distLeft = Math.abs(nose.x - leftJaw.x);
        const distRight = Math.abs(nose.x - rightJaw.x);
        const ratio = distLeft / distRight; 

        if (ratio < 0.75) return 'turn_right'; 
        if (ratio > 1.35) return 'turn_left';
        return 'center';
    };

    const handleVideoOnPlay = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current || processingRef.current || !modelsLoaded || !isSessionActive) return;
            if (videoRef.current.paused || videoRef.current.ended) return;

            const detections = await faceapi.detectAllFaces(videoRef.current)
                .withFaceLandmarks()
                .withFaceDescriptors()
                .withFaceExpressions();

            if (detections.length > 0) {
                setFaceDetected(true);
                const detection = detections[0];
                const expressions = detection.expressions;
                const landmarks = detection.landmarks;
                
                const currentPose = checkHeadPose(landmarks);
                
                let detectedAction = 'Netral';
                if (expressions.happy > 0.7) detectedAction = 'Senyum';
                else if (currentPose === 'turn_left') detectedAction = 'Kiri';
                else if (currentPose === 'turn_right') detectedAction = 'Kanan';
                setDebugInfo(`Terbaca: ${detectedAction}`);

                const activeStepIndex = stepRef.current;
                const currentChallenge = challengeQueue[activeStepIndex];

                if (currentChallenge) {
                    let isChallengePassed = false;
                    if (currentChallenge.type === 'smile') {
                        if (expressions.happy > 0.7) isChallengePassed = true;
                    } else {
                        if (currentPose === currentChallenge.type) isChallengePassed = true;
                    }

                    if (isChallengePassed) {
                        if (activeStepIndex < challengeQueue.length - 1) {
                            stepRef.current += 1;
                            setCurrentStep(stepRef.current);
                        } else {
                            clearInterval(intervalRef.current);
                            processingRef.current = true;
                            setIsProcessing(true);
                            // Submit dengan Descriptor + Snapshot
                            handleAttendanceSubmit(detection.descriptor);
                        }
                    }
                }
            } else {
                setFaceDetected(false);
                setDebugInfo("Wajah tidak terdeteksi");
            }
        }, 500);
    };

    // 6. Submit (DIPERBARUI DENGAN FORMDATA)
    const handleAttendanceSubmit = async (descriptor) => {
        try {
            // 1. Ambil Snapshot Wajah Saat Ini (Bukti Liveness)
            const photoBlob = await getSnapshot();
            
            if (!photoBlob) {
                throw new Error("Gagal mengambil foto bukti.");
            }

            // 2. Siapkan FormData
            const formData = new FormData();
            
            // Masukkan File Foto
            formData.append('image', photoBlob, 'attendance_proof.jpg');
            
            // Masukkan Data (Descriptor & Lokasi) sebagai JSON String
            const dataPayload = {
                descriptor: Array.from(descriptor),
                location: location
            };
            formData.append('data', JSON.stringify(dataPayload));

            // 3. Kirim ke Server
            const res = await axios.post('https://absensi-polinela.site/api/attendance/mark', formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' // Penting!
                }
            });

            stopCameraAndLoop();
            
            await Swal.fire({
                icon: 'success',
                title: 'Berhasil Terkirim!',
                text: 'Absensi Anda sedang divalidasi oleh Timdis.', // Pesan baru
                confirmButtonText: 'Lihat Status',
                confirmButtonColor: '#10b981'
            });
            navigate('/history');

        } catch (err) {
            stopCameraAndLoop();
            setIsSessionActive(false);

            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: err.response?.data?.msg || err.message || 'Error server.',
                confirmButtonText: 'Coba Lagi',
                confirmButtonColor: '#ef4444'
            }).then((result) => {
                if (result.isConfirmed) {
                    setIsSessionActive(true);
                }
            });
        }
    };

    const handleCancel = () => {
        stopCameraAndLoop();
        setIsSessionActive(false);
    };

    const handleManualStart = () => {
        setIsSessionActive(true);
    };

    const getCurrentIcon = () => {
        if (isProcessing) return <CheckCircle size={50} className="text-green-500 animate-bounce" />;
        if (!challengeQueue || challengeQueue.length === 0) return <Loader size={50} className="animate-spin text-blue-500" />;
        const currentChallenge = challengeQueue[currentStep];
        return currentChallenge ? currentChallenge.icon : <Loader size={50} />;
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.attendanceCard}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.title}>
                        <ScanFace size={28} className="text-blue-600" />
                        Absensi Biometrik
                    </h2>
                    
                    <div className={styles.statusContainer}>
                        <span className={`${styles.statusBadge} ${modelsLoaded ? styles.ready : styles.error}`}>
                            {modelsLoaded ? 'AI Siap' : 'Memuat AI...'}
                        </span>
                        <span className={`${styles.statusBadge} ${location ? styles.ready : styles.error}`}>
                            {location ? 'GPS Aktif' : (isSessionActive ? 'Mencari GPS...' : 'Standby')}
                        </span>
                    </div>
                </div>

                {isSessionActive ? (
                    <>
                        <div className={styles.challengeArea}>
                            <div className={styles.iconCircle}>
                                {isProcessing ? <CheckCircle size={50} className="text-green-500 animate-bounce"/> : getCurrentIcon()}
                            </div>
                            {isProcessing ? (
                                <h3 className={styles.challengeText} style={{color: '#10b981'}}>Mengirim Bukti...</h3>
                            ) : (
                                <>
                                    <h3 className={styles.challengeText}>
                                        {challengeQueue[currentStep]?.text || 'Persiapan...'}
                                    </h3>
                                    <p className={styles.challengeSub}>
                                        Langkah {currentStep + 1} dari {challengeQueue.length}
                                    </p>
                                </>
                            )}
                        </div>

                        <div className={styles.cameraWrapper}>
                            <video 
                                ref={videoRef} autoPlay muted playsInline 
                                onPlay={handleVideoOnPlay} className={styles.webcamVideo} 
                            />
                            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
                            
                            {isProcessing && (
                                <div className={styles.loadingOverlay}>
                                    <Loader size={48} className="animate-spin text-blue-500 mb-2"/>
                                    Mengambil Foto...
                                </div>
                            )}

                            {!isProcessing && (
                                <div className={`${styles.faceOverlay} ${faceDetected ? styles.active : ''}`} />
                            )}

                            <div className={styles.debugPill}>{debugInfo}</div>
                        </div>

                        <div className={styles.stepsContainer}>
                            {challengeQueue.map((_, idx) => (
                                <div key={idx} className={`${styles.stepDot} ${idx <= currentStep ? styles.active : ''}`} />
                            ))}
                        </div>

                        {locationError && (
                            <div className={styles.errorBox}><AlertTriangle size={18} /> {locationError}</div>
                        )}

                        <button onClick={handleCancel} className={styles.btnCancel} disabled={isProcessing}>
                            Batalkan Absensi
                        </button>
                    </>
                ) : (
                    <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.5s ease' }}>
                        <div style={{ 
                            width: '120px', height: '120px', background: '#eff6ff', 
                            borderRadius: '50%', display: 'flex', alignItems: 'center', 
                            justifyContent: 'center', marginBottom: '20px',
                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)',
                            border: '4px solid white'
                        }}>
                            <ScanFace size={60} className="text-blue-600" />
                        </div>
                        
                        <h3 style={{ color: '#1e293b', marginBottom: '10px', fontSize: '1.4rem' }}>Siap Melakukan Absensi?</h3>
                        <p style={{ color: '#64748b', marginBottom: '30px', maxWidth: '280px', lineHeight: '1.5' }}>
                            Wajah akan difoto otomatis setelah tantangan selesai untuk validasi Timdis.
                        </p>

                        <button 
                            onClick={handleManualStart}
                            style={{
                                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                color: 'white', border: 'none', padding: '16px 40px',
                                borderRadius: '50px', fontSize: '1.1rem', fontWeight: '700',
                                cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
                                display: 'flex', alignItems: 'center', gap: '12px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 15px 30px -5px rgba(37, 99, 235, 0.5)'; }}
                            onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 10px 25px -5px rgba(37, 99, 235, 0.4)'; }}
                        >
                            <Play size={22} fill="white" /> Mulai Absensi
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Attendance;