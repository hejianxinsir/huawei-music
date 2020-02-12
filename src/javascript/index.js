import './icons.js'
console.log('222')

const $ = selector => document.querySelector(selector)
const $$ =  selector => document.querySelector(selector)

class Player {
    constructor(node){
        this.root = typeof node === 'string' ? $(node) : node
        this.currentIndex = 0
        this.audio = new Audio
        this.start()
        this.bind()
    }

    start(){
        fetch('https://jirengu.github.io/data-mock/huawei-music/music-list.json')
            .then(res => res.json())
            .then(data => {
                console.log(data)
                this.songList = data
            })
    }

    bind(){
        this.root.querySelector('.btn-play-pause').onclick = () => {
            this.playSong()
        }
    }

    playSong(){
        this.audio.src = this.songList[this.curentIndex]
        this.audio.play()
    }

}

new Player('#player')