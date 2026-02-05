const TRLBadge = ({ trl }) => {
  const colors = {
    'TRL 9': 'badge-trl-9',
    'TRL 7': 'badge-trl-7'
  };
  return (
    <span className={`badge-trl ${colors[trl] || 'badge-trl-default'}`}>
      {trl}
    </span>
  );
};

export default TRLBadge;
