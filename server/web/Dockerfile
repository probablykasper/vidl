FROM node:8.9

RUN apt-get update && apt-get -y install sudo

# Get the Dependencies
RUN apt-get update -qq && \
    apt-get -y install \
        autoconf \
        automake \
        build-essential \
        cmake \
        git \
        libass-dev \
        libfreetype6-dev \
        libsdl2-dev \
        libtheora-dev \
        libtool \
        libva-dev \
        libvdpau-dev \
        libvorbis-dev \
        libxcb1-dev \
        libxcb-shm0-dev \
        libxcb-xfixes0-dev \
        mercurial \
        pkg-config \
        texinfo \
        wget \
        zlib1g-dev

# RUN mkdir ~/ffmpeg_sources
RUN mkdir -p ~/ffmpeg_sources ~/bin

# NASM
RUN cd ~/ffmpeg_sources \
    && wget http://www.nasm.us/pub/nasm/releasebuilds/2.13.02/nasm-2.13.02.tar.bz2 \
    && tar xjvf nasm-2.13.02.tar.bz2 \
    && cd nasm-2.13.02 \
    && ./autogen.sh \
    && PATH="$HOME/bin:$PATH" ./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin" \
    && make \
    && make install

# Yasm
RUN sudo apt-get install yasm

# libx264
RUN sudo apt-get -y install libx264-dev

# libx265
RUN cd ~/ffmpeg_sources \
    && if cd x265 2> /dev/null; then hg pull && hg update; else hg clone https://bitbucket.org/multicoreware/x265; fi \
    && cd x265/build/linux \
    && PATH="$HOME/bin:$PATH" cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX="$HOME/ffmpeg_build" -DENABLE_SHARED:bool=off ../../source \
    && PATH="$HOME/bin:$PATH" make \
    && make install

# libvpx
RUN cd ~/ffmpeg_sources \
    && git -C libvpx pull 2> /dev/null || git clone --depth 1 https://chromium.googlesource.com/webm/libvpx.git \
    && cd libvpx \
    && PATH="$HOME/bin:$PATH" ./configure --prefix="$HOME/ffmpeg_build" --disable-examples --disable-unit-tests --enable-vp9-highbitdepth --as=yasm \
    && PATH="$HOME/bin:$PATH" make \
    && make install

RUN cd ~/ffmpeg_sources \
    && git -C fdk-aac pull 2> /dev/null || git clone --depth 1 https://github.com/mstorsjo/fdk-aac \
    && cd fdk-aac \
    && autoreconf -fiv \
    && ./configure --prefix="$HOME/ffmpeg_build" --disable-shared \
    && make \
    && make install

# libmp3lame
RUN sudo apt-get -y install libmp3lame-dev

# libopus
RUN sudo apt-get -y install libopus-dev

RUN cd ~/ffmpeg_sources \
    && wget -O ffmpeg-snapshot.tar.bz2 http://ffmpeg.org/releases/ffmpeg-snapshot.tar.bz2 \
    && tar xjvf ffmpeg-snapshot.tar.bz2 \
    && cd ffmpeg \
    && PATH="$HOME/bin:$PATH" PKG_CONFIG_PATH="$HOME/ffmpeg_build/lib/pkgconfig" ./configure \
      --prefix="$HOME/ffmpeg_build" \
      --pkg-config-flags="--static" \
      --extra-cflags="-I$HOME/ffmpeg_build/include" \
      --extra-ldflags="-L$HOME/ffmpeg_build/lib" \
      --extra-libs="-lpthread -lm" \
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


COPY src/package.json .
RUN npm install -g  nodemon@1.12.1
RUN npm install && echo "woah x.x"


RUN cd /node_modules/youtube-dl \
    && npm run update \
    && bin/youtube-dl --version \
    && echo "woah"

WORKDIR /usr/src/app

COPY src .

CMD npm run start_${VIDL_ENV}
