import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
}
export const Button: React.FC<ButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#E7BE7F',
    borderRadius: 10,
    paddingVertical: 12,

    alignItems: 'center',

    height: 50,
    width: 120,
    position: 'relative',
    alignSelf: 'center',
    transform: [{ translateY: 0 }],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#1F1F1F',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
});

export default Button;
