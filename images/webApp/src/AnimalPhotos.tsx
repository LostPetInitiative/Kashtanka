import * as React from "react";
import * as DataModel from './DataModel'
import './AnimalPhotos.css'

function AnimalPhotos(props: { photos: DataModel.AnnotatedImage[] }) {
  const photos = props.photos;
  const imgStyle = { "margin": "10px" } as React.CSSProperties;
  const photoList = photos.map((image: DataModel.AnnotatedImage) =>
    <img style={imgStyle} key={image.ID} src={image.srcUrl} alt={image.ID.toFixed()} width="200" />
  );

  return (
    <div className="animalPhotosContainer">{photoList}</div>
  );
}

export default AnimalPhotos;