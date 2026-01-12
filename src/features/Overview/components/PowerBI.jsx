import React from 'react';

const PowerBI = () => {
  return (
    <div className="space-y-6">
      <iframe
        title="Committees"
        width="100%"
        height="900px"
        src="https://app.powerbi.com/reportEmbed?reportId=e95b8233-7ff4-4e09-b14f-86f195f1beee&autoAuth=true&ctid=72beb869-d73d-4622-9800-e5ef4e2ee3dc"
        frameBorder="0"
        allowFullScreen={true}
      ></iframe>
    </div>
  );
};

export default PowerBI;

