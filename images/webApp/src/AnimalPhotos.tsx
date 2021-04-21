import * as React from "react";
import * as DataModel from './DataModel'
import './AnimalPhotos.scss'

type PropsType = {
  photos: DataModel.AnnotatedImage[],
  selectedInd: number,
  selectionChanged: (selectedInd: number) => void
}

class AnimalPhotos extends React.Component<PropsType> {
  constructor(props : PropsType) {
    super(props);
  }

  handleImageClick(ind: number, e: (React.MouseEvent | null)) {
    if (this.props.selectionChanged !== null) {
        this.props.selectionChanged(ind)
    }
}

  render() {
    const photos = this.props.photos;
    const selectedInd = this.props.selectedInd;
    const total = photos.length;
    const photoList: JSX.Element[] = [];
    const startWithInd = total > 2 ? selectedInd - 1 : 0;
    const endWithInd = total > 1 ? selectedInd + 1 : startWithInd;

    for (let i: number = 0, j: number = startWithInd; i < total && j <= endWithInd; i++, j++) {
      const realInd = (photos.length + j) % photos.length;
      const image: DataModel.AnnotatedImage = photos[realInd];
      if(j === selectedInd) {
        photoList.push(<img key={image.ID} src={image.srcUrl} alt={image.ID.toFixed()} className="animalPhotosThumbnails selected" onClick={(e) => this.handleImageClick(j, e)}/>);
      }
      else {
        photoList.push(<img key={image.ID} src={image.srcUrl} alt={image.ID.toFixed()} className="animalPhotosThumbnails" onClick={(e) => this.handleImageClick(j, e)}/>);
      }
    }

    return (
      <div className="animalPhotosContainer">{photoList}</div>
    );
  }
}

export default AnimalPhotos;