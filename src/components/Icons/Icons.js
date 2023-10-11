import React from "react";

import Run from './../../../assets/icons/run.svg';
import Gym from './../../../assets/icons/gym.svg';

import Home from './../../../assets/icons/home.svg';
import Profile from './../../../assets/icons/profile.svg';
import Events from './../../../assets/icons/events.svg';
import Map from './../../../assets/icons/map.svg';
import Chat from './../../../assets/icons/chat.svg';
import Notifications from './../../../assets/icons/notifications.svg';
import Search from './../../../assets/icons/search.svg';
import Settings from './../../../assets/icons/settings.svg';

import Map2 from './../../../assets/icons/map2.svg';
import Watch from './../../../assets/icons/watch.svg';
import Date from './../../../assets/icons/date.svg';
import Sport from './../../../assets/icons/sport.svg';
import Profile2 from './../../../assets/icons/profile2.svg';
import Description from './../../../assets/icons/description.svg';

import Calendar from './../../../assets/icons/calendar.svg';
import CloseX from './../../../assets/icons/closeX.svg';
import AddImage from './../../../assets/icons/addImage.svg';
import AddVideo from './../../../assets/icons/addVideo.svg';
import LeftArrow from './../../../assets/icons/leftArrow.svg';
import PlayVideo from './../../../assets/icons/playVideo.svg';

const Icons = ({
  name,
  size = 15,
  fill = fill,
  style = style,
  onPress = onPress,
  stroke = stroke,
  color = color,
  strokeWidth = strokeWidth,
}) => {
  const Icon = {
    Run: Run,
    Gym: Gym,

    Home: Home,
    Profile: Profile,
    Events: Events,
    Map: Map,
    Chat: Chat,
    Notifications: Notifications,
    Search: Search,
    Settings: Settings,

    Map2: Map2,
    Watch: Watch,
    Date: Date,
    Sport: Sport,
    Profile2: Profile2,
    Description: Description,

    Calendar: Calendar,
    CloseX: CloseX,
    AddImage: AddImage,
    AddVideo: AddVideo,
    LeftArrow: LeftArrow,
    PlayVideo: PlayVideo,
    
  }[name];

  return (
    <Icon
      style={style}
      width={size}
      height={size}
      fill={fill}
      stroke={stroke}
      color={color}
      strokeWidth={strokeWidth}
      onPress={onPress}
    />
  );
};

export default Icons;
