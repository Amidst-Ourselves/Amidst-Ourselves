
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPassword } from '../forgotpassword.js';

describe('Password Reset', () => {

  test('Password Reset successfully', async () => {
    const setErrorMessageMock = jest.fn();
    
    jest.spyOn(window, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: 'updated' }),
      })
    );
    
    render(<ForgotPassword onForgotPassword={() => {}} setErrorMessage={setErrorMessageMock}  />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alan@ualberta.ca' } });
    fireEvent.change(screen.getByLabelText('Name your favourite city?'), { target: { value: 'edmonton' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'alan2' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Reset Password' }));

    expect(setErrorMessageMock).not.toHaveBeenCalled();
  });

  test('Password Reset Unsuccessfully', async () => {

    
    jest.spyOn(window, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: 'notupdated' }),
      })
    );
    
    render(<ForgotPassword onForgotPassword={() => {}}  />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alan@ualberta.ca' } });
    fireEvent.change(screen.getByLabelText('Name your favourite city?'), { target: { value: 'edmonton1' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'alan2' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Reset Password' }));

    const errorMessage = await screen.findByText("Invalid Input, can't change password.");
    
    expect(errorMessage).toBeInTheDocument();
    
  });





});
