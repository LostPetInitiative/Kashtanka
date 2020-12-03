import * as React from "react";
import AnimalPhotos from "./AnimalPhotos";
import { AnnotatedImage } from "./DataModel";
import './CarouselImgViewer.scss'

type PropsType = {
    imgSrcArray: AnnotatedImage[]
}

type StateType ={
    selectedIndx: number
}

class CarouselImgViewer extends React.Component<PropsType, StateType> {
    constructor(props : PropsType) {
      super(props);
      this.state = {selectedIndx : 0};
    }

    selectIndex = (total : number, selected : number) => {
        this.setState({selectedIndx: selected%total});
    }

    decreaseIndex = (total : number) => {
        this.setState({selectedIndx: (total + this.state.selectedIndx-1)%total});
    }

    increaseIndex = (total : number) => {
        this.setState({selectedIndx: (total + this.state.selectedIndx+1)%total});
    }

    carouselDots(total : number, selected : number) {
        const dotsArr: JSX.Element[] = [];
        for (let i = 0; i < total; i++) {
            dotsArr.push(<div className={`carouselDot ${selected != i ? "" : "carouselSelectedDot"}`} onClick={() => this.selectIndex(total, i)} key={i.toString()}>▢</div>);
        }
    
        return (
            <div className="carouselDots">{dotsArr}</div>
        )
    }
  
    render() {
      return (
          <div className="carouselImgViewer">
              <div className="carouselImgViewerMainPhoto">
                  <img src={this.props.imgSrcArray[this.state.selectedIndx].srcUrl} className="carouselImgViewerMainImg"/>
              </div>
              <div className="carouselImgViewerGoLeft" onClick={() => this.decreaseIndex(this.props.imgSrcArray.length)}>⇦</div>
              <div className="carouselImgViewerMiniPhotos">
                  <AnimalPhotos photos={this.props.imgSrcArray} selectedInd={this.state.selectedIndx}/>
              </div>
              <div className="carouselImgViewerGoRight" onClick={() => this.increaseIndex(this.props.imgSrcArray.length)}>⇨</div>
              <div className="carouselImgViewerDots">
                  {this.carouselDots(this.props.imgSrcArray.length, this.state.selectedIndx)}
              </div>
          </div>
      )
    }
}

export default CarouselImgViewer;