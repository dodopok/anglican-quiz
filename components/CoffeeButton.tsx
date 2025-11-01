import React, { useState } from 'react';

interface CoffeeButtonProps {
  className?: string;
}

const CoffeeButton: React.FC<CoffeeButtonProps> = ({ className = '' }) => {
  const [amount, setAmount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirecionar para o checkout do Stripe
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <label htmlFor="coffee-amount" className="text-sm text-gray-600">Amount:</label>
        <div className="flex items-center gap-1">
          <span className="text-sm">$</span>
          <input
            id="coffee-amount"
            type="number"
            min="1"
            max="100"
            step="1"
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            disabled={isLoading}
          />
        </div>
      </div>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="flex items-center gap-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-semibold rounded-full transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        <span className="text-xl">☕</span>
        {isLoading ? 'Processing...' : 'Buy me a coffee'}
      </button>
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Support the creator with a coffee tip!
      </p>
    </div>
  );
};

export default CoffeeButton;
