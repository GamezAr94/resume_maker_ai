'use client';
import React, { useState, useEffect } from 'react';

// --- PROPS INTERFACE ---
interface FeedbackModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (feedback: { rating: number; message: string }) => Promise<void>;
    isSubmitting: boolean;
}

// --- CONSTANTS ---
const MAX_MESSAGE_LENGTH = 500;

// --- STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
    backdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(3px)',
    },
    modal: {
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        maxWidth: '440px',
        width: 'calc(100% - 40px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        fontFamily: 'sans-serif',
        color: '#333',
    },
    title: {
        fontSize: '20px',
        fontWeight: 600,
        margin: '0 0 8px 0',
    },
    text: {
        margin: 0,
        color: '#555',
        fontSize: '14px',
        marginBottom: '16px',
    },
    ratingLabel: {
        fontWeight: 500,
        fontSize: '14px',
        marginBottom: '4px',
    },
    ratingContainer: {
        display: 'flex',
        gap: '4px',
        marginBottom: '16px',
        cursor: 'pointer',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px',
        minHeight: '80px',
        resize: 'vertical',
        boxSizing: 'border-box',
    },
    charCount: {
        fontSize: '12px',
        color: '#888',
        textAlign: 'right',
        marginTop: '4px',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '24px',
    },
    button: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        cursor: 'pointer',
        fontWeight: 600,
    },
    buttonDefault: {
        backgroundColor: '#f1f3f5',
        color: '#333',
        border: '1px solid #ddd',
    },
    buttonPrimary: {
        backgroundColor: '#228be6',
        color: 'white',
    },
    errorMessage: {
        color: '#fa5252',
        fontSize: '14px',
        marginTop: '16px',
    },
};

// --- STAR RATING COMPONENT ---
const Star = ({
    filled,
    size = 28,
    color = '#fcc419',
}: {
    filled: boolean;
    size?: number;
    color?: string;
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? color : 'none'}
        stroke={filled ? color : '#ced4da'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
    </svg>
);

// --- MAIN FEEDBACK MODAL COMPONENT ---
export default function FeedbackModal({
    opened,
    onClose,
    onSubmit,
    isSubmitting,
}: FeedbackModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!opened) {
            setTimeout(() => {
                setRating(0);
                setMessage('');
                setError('');
                setHoverRating(0);
            }, 200);
        }
    }, [opened]);

    const handleSubmit = async () => {
        setError('');
        if (rating === 0) {
            setError('Please select a star rating before submitting.');
            return;
        }
        if (message.length > MAX_MESSAGE_LENGTH) {
            setError(
                `Your message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
            );
            return;
        }
        await onSubmit({ rating, message });
    };

    if (!opened) return null;

    return (
        <div style={styles.backdrop} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.title}>Share Your Feedback</h2>
                <p style={styles.text}>
                    We&apos;d love to know what you think! Your feedback helps
                    us improve.
                </p>
                <p style={styles.ratingLabel}>Rate your experience</p>
                <div
                    style={styles.ratingContainer}
                    onMouseLeave={() => setHoverRating(0)}
                >
                    {[1, 2, 3, 4, 5].map((star) => (
                        <div
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                        >
                            <Star filled={star <= (hoverRating || rating)} />
                        </div>
                    ))}
                </div>
                <label
                    htmlFor="feedback-message"
                    style={{
                        ...styles.ratingLabel,
                        display: 'block',
                        marginBottom: '8px',
                    }}
                >
                    Optional message
                </label>
                <textarea
                    id="feedback-message"
                    style={styles.textarea}
                    placeholder="Tell us more about your experience..."
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    maxLength={MAX_MESSAGE_LENGTH}
                />
                <div style={styles.charCount}>
                    {message.length} / {MAX_MESSAGE_LENGTH}
                </div>
                {error && <p style={styles.errorMessage}>{error}</p>}
                <div style={styles.buttonGroup}>
                    <button
                        style={{ ...styles.button, ...styles.buttonDefault }}
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Skip
                    </button>
                    <button
                        style={{ ...styles.button, ...styles.buttonPrimary }}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </div>
            </div>
        </div>
    );
}
