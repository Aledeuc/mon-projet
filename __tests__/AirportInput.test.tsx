import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AirportInput from '../components/AirportInput';

// Mock des dépendances externes
jest.mock('react-native-safe-area-context', () => {
  const original = jest.requireActual('react-native-safe-area-context');
  return {
    ...original,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

describe('AirportInput Component', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <AirportInput
        value=""
        onValueChange={() => {}}
        placeholder="Select Airport"
        testID="airport-input"
      />
    );
    
    expect(getByTestId('airport-input')).toBeTruthy();
  });

  it('displays the selected value', () => {
    const { getByText } = render(
      <AirportInput
        value="CDG"
        label="Paris Charles de Gaulle"
        onValueChange={() => {}}
        placeholder="Select Airport"
        testID="airport-input"
      />
    );
    
    expect(getByText('CDG')).toBeTruthy();
    expect(getByText('Paris Charles de Gaulle')).toBeTruthy();
  });

  it('shows placeholder when no value is provided', () => {
    const { getByText } = render(
      <AirportInput
        value=""
        onValueChange={() => {}}
        placeholder="Select Airport"
        testID="airport-input"
      />
    );
    
    expect(getByText('Select Airport')).toBeTruthy();
  });

  // Ajoutez d'autres tests pour vérifier les interactions, 
  // l'ouverture du modal, la sélection d'un aéroport, etc.
});
