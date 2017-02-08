import Inferno from 'inferno'

const Nav = ({ children }) => {
  return (
    <nav class='nav'>
      <a class='logo' href="#">
        <h1>
          <span class='mini'>t</span><span class='full'>tekoa</span>
        </h1>
      </a>
      {children}

      <div class='settings'>
        <p></p>
      </div>
    </nav>
  )
}

export default Nav
