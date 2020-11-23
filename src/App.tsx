import React, { useEffect, useState} from 'react'
import './App.scss'
import queryString from 'query-string'
import YouTube from 'react-youtube'
import { BiMicrophoneOff, BiMicrophone } from 'react-icons/bi'
import { RiYoutubeFill } from 'react-icons/ri'
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io'
import { AiOutlineInfoCircle } from 'react-icons/ai'

type State = {
  videoUrl: string
  mark1: number
  mark2: number
  player?: any
  recognition?: any
  recognitionOn: boolean
  commandPaletteExpanded: boolean
}

type PlayerOptions = {
  width: string,
  height: string,
  playerVars?: {
    listType: 'playlist',
    playlist: string,
    list: string
  }
}

function App() {
  const defaultState: State = { 
    videoUrl: '',
    mark1: 0,
    mark2: 0,
    recognition: {},
    recognitionOn: false,
    commandPaletteExpanded: false
  }
  const [state, setState] = useState(defaultState)
  const { recognition,
    videoUrl,
    recognitionOn,
    player,
    commandPaletteExpanded,
    mark1,
    mark2 } = state

  const toggleCommandPalette = () => {
    const newState = !commandPaletteExpanded
    setState({ ...state, commandPaletteExpanded: newState})
  }

  useEffect(() => {
    const SpeechRecognition = window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    setState({...state, recognition})
  }, [])

  // recognition.onerror = () => {
  //   console.log("Recognition error")
  // }

  // recognition.onend = () => {
  //   if (!recognitionOn) return
  //   try {
  //     startRecognition()
  //   } catch (e) {}
  // }
   
  recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript
      const command: string = transcript.trim().toLowerCase()
      const seekSynonyms = ['seek', 'cheek', 'speak', 'eek', 'think', 'sink', 'sync']
      const playSynonyms = ['play', 'blake', 'say', 'hey', 'start', 'lake']
      const waitSynonyms = ['wait', 'wake']

      const matchCommand = (synonym: string) => command === synonym
      
      switch(command) {
        case playSynonyms.find(matchCommand):
          player?.playVideo()
          break;
        case 'stop':
          player?.stopVideo()
          break;
        case waitSynonyms.find(matchCommand):
          player?.pauseVideo()
          break;
        case 'first': 
          player?.seekTo(mark1)
          break;
        case 'second':
          player?.seekTo(mark2)
          break;
        case seekSynonyms.find(matchCommand):
          player?.seekTo(30)
          break;
        default:
      }
  }

  const startRecognition = () => {
    recognition.start()
    console.log("Recognition started")
    setState({ ...state, recognitionOn: true })
  }

  const stopRecognition = () => {
    recognition.stop()
    console.log('Recognition stopped')
    setState({ ...state, recognitionOn: false })
  }

  const handleChange = (e: any) => {
    e.preventDefault()
    const key = e.target.id
    const value = e.target.value
    setState({...state, [key]: value})
  }

  const playerOnReady = (event: any) => {
    const player = event.target
    setState({...state, player})
  }

  const getVideoId = (videoUrl: string): string => {
    return queryString.parseUrl(videoUrl)?.query?.v as string
  }

  const getPlaylistId = (videoUrl: string): string => {
    return queryString.parseUrl(videoUrl)?.query?.list as string
  }

  const getPlayerOptions = (playlistId: string, width: string = '100%', height: string = '100%'): PlayerOptions => {
    let playerOpts: any = {
      width,
      height
    }

    if (playlistId) {
      playerOpts.playerVars = {
        listType: 'playlist',
        playlist: playlistId,
        list: playlistId
      }
    }
    return playerOpts
  }

  const startListeningButton = (
    <a href="#" className="roundButton buttonStart" onClick={startRecognition}>
      <BiMicrophone color="black"/>
    </a>
  )

  const stopListeningButton = (
    <a href="#" className="roundButton buttonStop" onClick={stopRecognition}>
      <BiMicrophoneOff color="black"/>
    </a>
  )

  const marks = (
    <div>
      <div>
        <input id="mark1" type="number" className="css-input" value={mark1}  onChange={handleChange} />
        <div>Mark 1</div>
      </div>
      <div>
        <input id="mark2" type="number" className="css-input" value={state.mark2} onChange={handleChange} />
        <div>Mark 2</div>
      </div>
    </div>
  )

  const commandPalette = (
    <div className="ui-wrapper commandPalette">
      Say with firm and confident voice:<br />
      <br />
      <strong>'play'</strong><br />
      <strong>'stop'</strong>,<br />
      <strong>'first'</strong> - seeks to first mark,<br />
      <strong>'second'</strong>- seeks to second mark,<br />
      <strong>'wait'</strong> - pauses video,<br />
      <strong>'seek'</strong> - seeks 30 second forward
    </div>
  )

  const info = (
    <a href="https://github.com/mirkka/YVCO" target="blank" className="info">github.com/mirkka/YVCO</a>
  )

  const videoId = getVideoId(videoUrl)
  const playlistId = getPlaylistId(videoUrl)

  return (
    <div className="App">
      <div className="ui-wrapper">
        <div className="expandCommandsPalette" onClick={toggleCommandPalette}>
          {'commands'}
          {commandPaletteExpanded ? <IoIosArrowBack /> : <IoIosArrowForward />}
        </div>
        <div className="button-wrapper">
          {recognitionOn ? stopListeningButton : startListeningButton}
        </div>
        <div>
          <input type="text" className="css-input" value={videoUrl} id="videoUrl" onChange={handleChange} />
          <div>
            <div>Video URL</div>
            <a href="https://www.youtube.com" target="blank" className="icon">
              <RiYoutubeFill color="red" />
            </a>
          </div>
        </div>
        {videoId && marks}
        <div className='info-wrapper'><AiOutlineInfoCircle />
          {info}
        </div>
      </div>
      {commandPaletteExpanded && commandPalette}
      {videoId && <YouTube videoId={videoId} opts={getPlayerOptions(playlistId)} onReady={playerOnReady} />}
    </div>
  )
}

export default App
