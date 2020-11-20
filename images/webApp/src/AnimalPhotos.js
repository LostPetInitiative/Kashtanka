function AnimalPhotos(props) {
    const photos = props.photos;
    const photoList = photos.map((image) =>
        <li key={image.id}>
          <img src={image.src} alt={image.id} width="200"/>
        </li>
    );
  
    return (
        <ul>{photoList}</ul>
    );
  }

export default AnimalPhotos;