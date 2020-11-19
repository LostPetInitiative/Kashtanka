import * as React from "react";
import * as DataModel from './DataModel'

function AnimalPhotos(props : {photos : DataModel.AnnotatedImage[]} ) {
    const photos = props.photos;
    const photoList = photos.map((image: DataModel.AnnotatedImage) =>
        <li key={image.ID}>
          <img src={image.srcUrl} alt={image.ID.toFixed()} width="200"/>
        </li>
    );
  
    return (
        <ul>{photoList}</ul>
    );
  }

export default AnimalPhotos;