   import './icons.js';
   import Swiper from './swiper.js';

   class Player {
       constructor(node){
           this.root = typeof node === 'string' ? document.querySelector(node) : node
           this.$ = selector => this.root.querySelector(selector)
           this.$$ = selector => this.root.querySelectorAll(selector)

           this.songList = []
           this.lyricsArr = []
           this.lyricIndex = -1
           this.currentIndex = 0
           this.audio = new Audio()

           this.start()
           this.bind()
       }

       start() {
           fetch('https://jirengu.github.io/data-mock/huawei-music/music-list.json')
               .then(res => res.json())
               .then(data => {
                   console.log('data')
                   console.log(data)
                   this.songList = data
                   this.loadSong()
                   console.log('this.songList')
                   console.log(this.songList)
               })
       }

       bind() {
           let self = this
           this.$('.btn-play-pause').onclick = function() {
               if(this.classList.contains('playing')) {
                   self.audio.pause()
                   this.classList.remove('playing')
                   this.classList.add('pause')
                   this.querySelector('use').setAttribute('xlink:href', '#icon-play')
               }else if(this.classList.contains('pause')) {
                   self.audio.play()
                   this.classList.add('playing')
                   this.classList.remove('pause')
                   this.querySelector('use').setAttribute('xlink:href', '#icon-pause')
               }
           }

           this.$('.btn-pre').onclick = function(){
               console.log('pre')
               self.currentIndex = (self.songList.length + self.currentIndex - 1) % self.songList.length
               self.loadSong()
               self.playSong()
           }

           this.$('.btn-next').onclick = function(){
               self.currentIndex = (self.currentIndex + 1) % self.songList.length
               self.loadSong()
               self.playSong()
           }

           this.audio.ontimeupdate = function(){
               console.log(parseInt(self.audio.currentTime * 1000))
               self.locateLyric()
               self.setProgressBar()
           }

           let swiper = new Swiper(this.$('.panels'))
           swiper.on('swipLeft', function(){
             console.log('left')
             this.classList.remove('panels1')
             this.classList.add('panels2')
             self.$('.balls .first').classList.remove('current')
             self.$('.balls .second').classList.add('current')
           })

           swiper.on('swipRight', function(){
             console.log('right')
             this.classList.remove('panels2')
             this.classList.add('panels1')
             self.$('.balls .first').classList.add('current')
             self.$('.balls .second').classList.remove('current')
           })
       }

       loadSong(){
           let songObj = this.songList[this.currentIndex]
           this.$('.header h1').innerText = songObj.title
           this.$('.header p').innerText = songObj.author + '-' + songObj.albumn
           this.audio.src = songObj.url
           this.audio.onloadedmetadata = () => this.$('.time-end').innerText = this.formateTime(this.audio.duration)

           this.loadLyric()
       }

       playSong(){
           this.audio.oncanplaythrough = () => this.audio.play()
       }

       loadLyric(){
           fetch(this.songList[this.currentIndex].lyric)
               .then(res => res.json())
               .then(data => {
                   console.log(data.lrc.lyric)
                   this.setLyrics(data.lrc.lyric)
                   Window.lyrics = data.lrc.lyric
               })
       }

       locateLyric() {
         console.log('locateLyric')
         let currentTime = this.audio.currentTime*1000
         let nextLineTime = this.lyricsArr[this.lyricIndex+1][0]
         if(currentTime > nextLineTime && this.lyricIndex < this.lyricsArr.length - 1) {
           this.lyricIndex++
           let node = this.$('[data-time="'+this.lyricsArr[this.lyricIndex][0]+'"]')
           if(node) this.setLineToCenter(node)
           this.$$('.panels-effect .lyrics p')[0].innerText = this.lyricsArr[this.lyricIndex][1]
           this.$$('.panels-effect .lyrics p')[1].innerText = this.lyricsArr[this.lyricIndex+1] ? this.lyricsArr[this.lyricIndex+1][1] : ''
           console.dir(this.$$('.panels-effect .lyrics p'));console.log('999999999')
         }
       }

       setLyrics(lyrics) {
           this.lyricIndex = 0
           let fragment = document.createDocumentFragment()
           let lyricsArr  = []
           this.lyricsArr = lyricsArr
           lyrics.split(/\n/)
             .filter(str => str.match(/\[.+?\]/))
             .forEach(line => {
               let str = line.replace(/\[.+?\]/g, '')
               line.match(/\[.+?\]/g).forEach(t=>{
                 t = t.replace(/[\[\]]/g,'')
                 let milliseconds = parseInt(t.slice(0,2))*60*1000 + parseInt(t.slice(3,5))*1000 + parseInt(t.slice(6))
                 lyricsArr.push([milliseconds, str])
               })
             })
    
             lyricsArr.filter(line => line[1].trim() !== '').sort((v1, v2) => {
               if(v1[0] > v2[0]) {
                 return 1
               } else {
                 return -1
               }
             }).forEach(line => {
                 let node = document.createElement('p')
                 node.setAttribute('data-time', line[0])
                 node.innerText = line[1]
                 fragment.appendChild(node)
               })
             this.$('.panels-lyrics .container').innerHTML = ''
             this.$('.panels-lyrics .container').appendChild(fragment)
         }

       setLineToCenter(node){
           let translateY = node.offsetTop - this.$('.panels-lyrics').offsetHeight / 2
           translateY = translateY > 0 ? translateY : 0
           this.$('.panels-lyrics .container').style.transform = `translateY(-${translateY}px)`
           this.$$('.panels-lyrics p').forEach(node => node.classList.remove('current'))
           node.classList.add('current')
       }

       setProgressBar() {
           let percent = (this.audio.currentTime * 100 / this.audio.duration) + '%'
           this.$('.bar .progress').style.width = percent
           this.$('.time-start').innerText = this.formateTime(this.audio.currentTime)
       }

       formateTime(secondsTotal) {
           let minutes = parseInt(secondsTotal/60)
           minutes = minutes >= 10 ? '' + minutes : '0' + minutes
           let seconds = parseInt(secondsTotal%60)
           seconds = seconds >= 10 ? '' + seconds : '0' + seconds
           return minutes + ':' + seconds
       }

   }

   window.player = new Player('#player')




