import * as React from "react";
import * as DataModel from './DataModel'
import './AnimalPhotos.scss'

function AnimalPhotos(props: {photos: DataModel.AnnotatedImage[], selectedInd: number}) {
  const photos = props.photos;
  const selectedInd = props.selectedInd;
  const total = photos.length;
  const photoList: JSX.Element[] = [];
  const startWithInd = total > 2 ? selectedInd - 1 : 0;
  const endWithInd = total > 1 ? selectedInd + 1 : startWithInd;
  for (let i: number = 0, j: number = startWithInd; i < total && j <= endWithInd; i++, j++) {
    const realInd = (photos.length + j) % photos.length;
    const image: DataModel.AnnotatedImage = photos[realInd];
    if(j === selectedInd) {
      photoList.push(<img key={image.ID} src={image.srcUrl} alt={image.ID.toFixed()} className="animalPhotosThumbnails selected"/>);
    }
    else {
      photoList.push(<img key={image.ID} src={image.srcUrl} alt={image.ID.toFixed()} className="animalPhotosThumbnails"/>);
    }
  }

  return (
    <div className="animalPhotosContainer">{photoList}</div>
  );
}

export default AnimalPhotos;