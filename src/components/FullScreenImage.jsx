const FullScreenImage = ({ imageUrl, buttonText, onClick }) => {
    return (
      <div className="fullscreen-container">
        <img src={imageUrl} alt="Landing page image" className="fullscreen-image" />
        <button className="centered-button" onClick={onClick}>
          {buttonText}
        </button>
      </div>
    );
  };
  
  export default FullScreenImage;