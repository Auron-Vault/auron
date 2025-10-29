import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Canvas from 'react-native-canvas'; // Or another canvas library

const MatrixBackground = () => {
  const canvasRef = useRef<Canvas>(null);
  const [columns, setColumns] = useState<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = Dimensions.get('window').width;
    canvas.height = Dimensions.get('window').height;

    const fontSize = 16;
    const columnsCount = canvas.width / fontSize;
    const initialColumns = Array(Math.floor(columnsCount)).fill(0);
    setColumns(initialColumns);

    let animationFrameId: number;
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Fading effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0'; // Green text
      ctx.font = `${fontSize}px monospace`;

      columns.forEach((y, index) => {
        const text = String.fromCharCode(0x30a0 + Math.random() * 96); // Katakana characters
        ctx.fillText(text, index * fontSize, y);

        if (y > canvas.height && Math.random() > 0.975) {
          columns[index] = 0; // Reset column when it goes off screen
        } else {
          columns[index] = y + fontSize;
        }
      });
      setColumns([...columns]); // Trigger re-render with updated column positions
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [columns]);

  return (
    <View style={styles.container}>
      <Canvas ref={canvasRef} style={StyleSheet.absoluteFillObject} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default MatrixBackground;
