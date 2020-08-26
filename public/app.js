class Form extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      alias: '',
      url: '',
      response: null
    }
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  onSubmit = (e) => {
    const { alias, url } = this.state
    fetch('/url', {
       method: 'POST',
       headers: {
        'content-type': 'application/json'
       },
       body: JSON.stringify({ alias, url })
    })
    .then((response) => {
      return response.json()
    })
    .then((response) => {
      this.setState({ response })
    })
    .catch((error) => {
      this.setState({ response: error })
    })
    e.preventDefault()
  }

  render () {
    const { response } = this.state
    return (
      <div style={{ display: 'inline-grid' }}>
        <form style={{ display: 'inline-grid' }} onSubmit={e => this.onSubmit(e)}>
          <label htmlFor="alias">Alias</label>
          <input id="alias" name="alias" type="text" onChange={e => this.onChange(e)} />
          <label htmlFor="url">Url</label>
          <input id="url" name="url" type="text" onChange={e => this.onChange(e)} />
          <button type="submit">create</button>
        </form>
        {
          response ? (
            <span>{ JSON.stringify(response) }</span>
          ) : null
        }
      </div>
    )
  }
}

ReactDOM.render(
  <Form />,
  document.getElementById('root')
)
