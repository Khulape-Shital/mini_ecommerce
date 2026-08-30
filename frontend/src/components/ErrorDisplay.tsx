

export const ErrorDisplay: React.FC<{ message?: string }> = ({ message = 'An error occurred' }) => (
  <div style={{ padding: '1rem', color: 'red', border: '1px solid red', borderRadius: '4px' }}>
    <p>Error: {message}</p>
  </div>
);
