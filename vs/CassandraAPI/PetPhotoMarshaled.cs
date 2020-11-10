using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CassandraAPI
{
    public class PetPhotoMarshaled
    {
        public string Namespace { get; set; }
        public string LocalID { get; set; }

        public int ImageNum { get; private set; }
        public string AnnotatedImage { get; private set; }
        public string AnnotatedImageType { get; private set; }
        public double DetectionConfidence { get; private set; }
        public int DetectionRotation { get; private set; }

        public PetPhotoMarshaled(PetPhoto photo)
        {
            this.Namespace = photo.Namespace;
            this.LocalID = photo.LocalID;

            this.ImageNum = photo.ImageNum;
            this.AnnotatedImageType = photo.AnnotatedImageType;
            this.DetectionConfidence = photo.DetectionConfidence;
            this.DetectionRotation = photo.DetectionRotation;
            this.AnnotatedImage = Convert.ToBase64String(photo.AnnotatedImage);
        }

        public PetPhoto ToPetPhoto() {
            return new PetPhoto()
            {
                Namespace = this.Namespace,
                LocalID = this.LocalID,

                AnnotatedImage = Convert.FromBase64String(this.AnnotatedImage),
                AnnotatedImageType = this.AnnotatedImageType,
                DetectionConfidence = this.DetectionConfidence,
                DetectionRotation = this.DetectionRotation,
                ImageNum = this.ImageNum
            };

        }
    }
}
