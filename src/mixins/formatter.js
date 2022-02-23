export default {
  computed: {
    formatCurrency() {
      return amount =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 15,
        }).format(amount);
    },
  },
};
