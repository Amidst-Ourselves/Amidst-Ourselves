
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Register } from '../register.jsx';

describe('Register', () => {

  it('Register successfully', async () => {
    const setErrorMessageMock = jest.fn();
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: 'added' }),
      })
    );
    
    render(<Register onRegister={() => {}} setErrorMessage={setErrorMessageMock} />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'alan' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alan@ualberta.ca' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'alan' } });
    fireEvent.change(screen.getByLabelText('Name your favourite city?'), { target: { value: 'edmonton' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Register' }));

    expect(setErrorMessageMock).not.toHaveBeenCalled();
  });




  test('Register unsuccessfully', async () => {

    const mockHistoryPush = jest.fn();

    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ message: 'exist' }) }));

    render(<Register history={{ push: mockHistoryPush }} />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'alan' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alan@ualberta.ca' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'alan' } });
    fireEvent.change(screen.getByLabelText('Name your favourite city?'), { target: { value: 'edmonton' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Register' }));

    const errorMessage = await screen.findByText('User already exist.');

    expect(mockHistoryPush).not.toHaveBeenCalled();
    expect(errorMessage).toBeInTheDocument();
  });

  test('Profanity Test',async () => {
    render(<Register />);


    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'fuck' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Register' }));

    const errorMessage = await screen.findByText('Name contains profanity words. Please try with another name.');

    expect(errorMessage).toBeInTheDocument();
  });



});
