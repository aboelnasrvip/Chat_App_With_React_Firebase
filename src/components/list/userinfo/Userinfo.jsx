import { useUserStore } from "../../../lib/userStore";
import "./Userinfo.css"
const Userinfo = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  return (
    <div className='userinfo'>
      <div className='user'>
        <img src={currentUser.avatar || './avatar.png'} alt="" />
        <h2>{currentUser.username}</h2>
      </div>

      <div className='icons'>
      <img src="./more.png" alt="more.png" />
      <img src="./video.png" alt="video.png" />
      <img src="./edit.png" alt="edit.png" />
      </div>
    </div>
  )
}

export default Userinfo