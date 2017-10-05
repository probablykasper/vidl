FROM node:8.6

RUN apt-get update && apt-get -y install sudo

# Get the Dependencies
RUN sudo apt-get update
RUN sudo apt-get -y install autoconf automake build-essential libass-dev libfreetype6-dev \
  libsdl2-dev libtheora-dev libtool libva-dev libvdpau-dev libvorbis-dev libxcb1-dev libxcb-shm0-dev \
  libxcb-xfixes0-dev pkg-config texinfo wget zlib1g-dev

RUN mkdir ~/ffmpeg_sources

# Yasm
RUN sudo apt-get install yasm

# nasm
RUN cd ~/ffmpeg_sources \
    && wget http://www.nasm.us/pub/nasm/releasebuilds/2.13.01/nasm-2.13.01.tar.bz2 \
    && tar xjvf nasm-2.13.01.tar.bz2 \
    && cd nasm-2.13.01 \
    && ./autogen.sh \
    && PATH="$HOME/bin:$PATH" ./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin" \
    && PATH="$HOME/bin:$PATH" make \
    && make install

# libx264
RUN sudo apt-get -y install libx264-dev

# libx265
RUN sudo apt-get -y install cmake mercurial
RUN cd ~/ffmpeg_sources
RUN hg clone https://bitbucket.org/multicoreware/x265
RUN cd x265/build/linux \
    && PATH="$HOME/bin:$PATH" cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX="$HOME/ffmpeg_build" -DENABLE_SHARED:bool=off ../../source \
    && make \
    && make install

# libfdk-aac
RUN cd ~/ffmpeg_sources \
    && wget -O fdk-aac.tar.gz https://github.com/mstorsjo/fdk-aac/tarball/master \
    && tar xzvf fdk-aac.tar.gz \
    && cd mstorsjo-fdk-aac* \
    && autoreconf -fiv \
    && ./configure --prefix="$HOME/ffmpeg_build" --disable-shared \
    && make \
    && make install

# libmp3lame
RUN sudo apt-get -y install libmp3lame-dev

# libopus
RUN sudo apt-get -y install libopus-dev

# libvpx
RUN sudo apt-get install libvpx-dev

# ffmpeg
RUN cd ~/ffmpeg_sources \
    && wget http://ffmpeg.org/releases/ffmpeg-snapshot.tar.bz2 \
    && tar xjvf ffmpeg-snapshot.tar.bz2 \
    && cd ffmpeg \
    && PATH="$HOME/bin:$PATH" PKG_CONFIG_PATH="$HOME/ffmpeg_build/lib/pkgconfig" ./configure \
      --prefix="$HOME/ffmpeg_build" \
      --pkg-config-flags="--static" \
      --extra-cflags="-I$HOME/ffmpeg_build/include" \
      --extra-ldflags="-L$HOME/ffmpeg_build/lib" \
      --bindir="$HOME/bin" \
      --enable-gpl \
      --enable-libass \
      --enable-libfdk-aac \
      --enable-libfreetype \
      --enable-libmp3lame \
      --enable-libopus \
      --enable-libtheora \
      --enable-libvorbis \
      --enable-libvpx \
      --enable-libx264 \
      --enable-libx265 \
      --enable-nonfree \
    && PATH="$HOME/bin:$PATH" make \
    && make install \
    && hash -r


RUN npm install -g  nodemon@1.12.1

RUN npm install     base32@0.0.6
RUN npm install     sanitize-filename@1.6.1

RUN npm install     express@4.16.1
RUN npm install     ws@3.2.0
RUN npm install     socket.io@2.0.3

RUN npm install     pug@2.0.0-rc.4
RUN npm install     node-sass@4.5.3
RUN npm install     fs-path@0.0.23

RUN npm install     youtube-dl@1.12.2

WORKDIR /usr/src/app

COPY src .

CMD ["npm", "run", "start"]
