import React from 'react';

const Modal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'نعم', cancelText = 'لا' }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
      }}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button onClick={onCancel} style={{
            padding: '8px 15px',
            backgroundColor: '#ccc',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>{cancelText}</button>
          <button onClick={onConfirm} style={{
            padding: '8px 15px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
