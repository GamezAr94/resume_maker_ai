import { Text } from '@mantine/core';
import styles from './CharacterCounter.module.css';

// Define the props that this component will accept
interface CharacterCounterProps {
    currentLength: number;
    maxLength: number;
}

/**
 * A simple component to display a character count like "123 / 500".
 */
export default function CharacterCounter({
    currentLength,
    maxLength,
}: CharacterCounterProps) {
    return (
        <Text component="div" size="xs" className={styles.counter}>
            {currentLength} / {maxLength}
        </Text>
    );
}
