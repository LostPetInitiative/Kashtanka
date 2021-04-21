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
            if(selected !== i) {
                dotsArr.push(<div className="carouselDot"  onClick={() => this.selectIndex(total, i)} key={i.toString()}>◇</div>);
            }
            else {
                dotsArr.push(<div className="carouselDot carouselSelectedDot" onClick={() => this.selectIndex(total, i)} key={i.toString()}>◆</div>);
            }
        }
    
        return (
            <div className="carouselDots">{dotsArr}</div>
        )
    }
  
    render() {
        //const s : React.CSSProperties = {background: "red", width:"100%", height:"100%"}
      return (
          <div className="carouselImgViewer">
              <div className={`carouselImgViewerMainPhoto ${this.props.imgSrcArray.length > 1 ? "" : "onePhotoCard"}`}>
                  <img alt="Фото животного" src={this.props.imgSrcArray[this.state.selectedIndx].srcUrl} className="carouselImgViewerMainImg"/>
                  {/* <div style={s}></div> */}
              </div>
              <div className={`carouselImgViewer2row ${this.props.imgSrcArray.length > 1 ? "" : "displayNone"}`}>
                <div className="carouselImgViewerGoLeft" onClick={() => this.decreaseIndex(this.props.imgSrcArray.length)}>⇦</div>
                <div className="carouselImgViewerMiniPhotos">
                    <AnimalPhotos photos={this.props.imgSrcArray} selectedInd={this.state.selectedIndx} selectionChanged={(i) => this.selectIndex(this.props.imgSrcArray.length, i)}/>
                </div>
                <div className="carouselImgViewerGoRight" onClick={() => this.increaseIndex(this.props.imgSrcArray.length)}>⇨</div>
                <div className="carouselImgViewerDots">
                    {this.carouselDots(this.props.imgSrcArray.length, this.state.selectedIndx)}
                </div>
              </div>
          </div>
      )
    }
}

export default CarouselImgViewer;