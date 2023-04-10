
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from '../login.jsx';

describe('Login', () => {

  it('login successfully', async () => {
    const setErrorMessageMock = jest.fn();
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: 'match', name: 'alan', email: 'alan@ualberta.ca' }),
      })
    );
    
    render(<Login onLogin={() => {}} setErrorMessage={setErrorMessageMock} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alan@ualberta.ca' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'alan' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Log In' }));

    expect(setErrorMessageMock).not.toHaveBeenCalled();
  });

  test('login unsuccessfully', async () => {
    const mockOnLogin = jest.fn();
    const mockHistoryPush = jest.fn();

    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ message: 'Invalid username/password or User already logged in.' }) }));

    render(<Login onLogin={mockOnLogin} history={{ push: mockHistoryPush }} />);


    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alan@ualberta.ca' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    const errorMessage = await screen.findByText('Invalid username/password or User already logged in.');

    expect(mockOnLogin).not.toHaveBeenCalled();
    expect(mockHistoryPush).not.toHaveBeenCalled();
    expect(errorMessage).toBeInTheDocument();
  });

});
