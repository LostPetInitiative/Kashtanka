FROM python:3.6-slim

#RUN apt-get update && apt-get install --no-install-recommends --no-install-suggests -y python3.6 python3-pip && \
#    rm -rf /var/lib/apt/lists/*

WORKDIR /tmp
COPY tensorflow-2.3.0-cp36-cp36m-linux_x86_64_compute_built_no_avx.whl /tmp/tensorflow-2.3.0-cp36-cp36m-linux_x86_64.whl
RUN pip3 install tensorflow-2.3.0-cp36-cp36m-linux_x86_64.whl && rm tensorflow-2.3.0-cp36-cp36m-linux_x86_64.whl
CMD ["/bin/bash", "-c", "--" , "while true; do sleep 30; done;"]