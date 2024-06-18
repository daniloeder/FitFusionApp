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
import Fire from './../../../assets/icons/fire.svg';

import Calendar from './../../../assets/icons/calendar.svg';
import CloseX from './../../../assets/icons/closeX.svg';
import AddImage from './../../../assets/icons/addImage.svg';
import AddVideo from './../../../assets/icons/addVideo.svg';
import LeftArrow from './../../../assets/icons/leftArrow.svg';
import RightArrow from './../../../assets/icons/rightArrow.svg';
import Back from './../../../assets/icons/back.svg';
import PlayVideo from './../../../assets/icons/playVideo.svg';
import EyeSlash from './../../../assets/icons/eyeSlash.svg';
import Eye from './../../../assets/icons/eye.svg';
import Images from './../../../assets/icons/Images.svg';
import Google from './../../../assets/icons/google.svg';
import Facebook from './../../../assets/icons/Facebook.svg';
import Edit from './../../../assets/icons/edit.svg';

import BodyBuilding from './../../../assets/icons/sports/BodyBuilding.svg';
import AmericanFootball from './../../../assets/icons/sports/American_Football.svg';
import CanoeingKayaking from './../../../assets/icons/sports/Canoeing_Kayaking.svg';
import Gymnastics from './../../../assets/icons/sports/Gymnastics.svg';
import Sailing from './../../../assets/icons/sports/Sailing.svg';
import TableTennis from './../../../assets/icons/sports/Table_Tennis.svg';
import Archery from './../../../assets/icons/sports/Archery.svg';
import Cricket from './../../../assets/icons/sports/Cricket.svg';
import IceHockey from './../../../assets/icons/sports/Ice_Hockey.svg';
import Skateboarding from './../../../assets/icons/sports/Skateboarding.svg';
import Tennis from './../../../assets/icons/sports/Tennis.svg';
import Badminton from './../../../assets/icons/sports/Badminton.svg';
import Cycling from './../../../assets/icons/sports/Cycling.svg';
import MartialArts from './../../../assets/icons/sports/Martial_Arts.svg';
import Skiing from './../../../assets/icons/sports/Skiing.svg';
import TrackAndField from './../../../assets/icons/sports/Track_and_Field.svg';
import Baseball from './../../../assets/icons/sports/Baseball.svg';
import Equestrian from './../../../assets/icons/sports/Equestrian.svg';
import MountainBiking from './../../../assets/icons/sports/Mountain_Biking.svg';
import Snowboarding from './../../../assets/icons/sports/Snowboarding.svg';
import Volleyball from './../../../assets/icons/sports/Volleyball.svg';
import Basketball from './../../../assets/icons/sports/Basketball.svg';
import Fencing from './../../../assets/icons/sports/Fencing.svg';
import RockClimbing from './../../../assets/icons/sports/Rock_Climbing.svg';
import Soccer from './../../../assets/icons/sports/Soccer.svg';
import Wrestling from './../../../assets/icons/sports/Wrestling.svg';
import Bowling from './../../../assets/icons/sports/Bowling.svg';
import FieldHockey from './../../../assets/icons/sports/Field_Hockey.svg';
import RollerSkating from './../../../assets/icons/sports/Roller_Skating.svg';
import Surfing from './../../../assets/icons/sports/Surfing.svg';
import Boxing from './../../../assets/icons/sports/Boxing.svg';
import Golf from './../../../assets/icons/sports/Golf.svg';
import Rugby from './../../../assets/icons/sports/Rugby.svg';
import Swimming from './../../../assets/icons/sports/Swimming.svg';

import SendMessage from './../../../assets/icons/sendMessage.svg';
import ParticipantRequest from './../../../assets/icons/participantRequest.svg';
import ParticipantEdit from './../../../assets/icons/participantEdit.svg';
import Camera from './../../../assets/icons/camera.svg';
import QRCode from './../../../assets/icons/qrcode.svg';
import OkV from './../../../assets/icons/ok-v.svg';
import Add from './../../../assets/icons/add.svg';
import Paste from './../../../assets/icons/paste.svg';
import Fitness from './../../../assets/icons/fitness.svg';

import GradientCircle from './../../../assets/icons/gradientCircle.svg';
import Subscription from './../../../assets/icons/subscription.svg';

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
    Fire: Fire,

    Calendar: Calendar,
    CloseX: CloseX,
    AddImage: AddImage,
    AddVideo: AddVideo,
    LeftArrow: LeftArrow,
    RightArrow: RightArrow,
    Back: Back,
    PlayVideo: PlayVideo,
    Eye: Eye,
    Images: Images,
    EyeSlash: EyeSlash,
    Google: Google,
    Facebook: Facebook,
    Edit: Edit,
    
    BodyBuilding: BodyBuilding,
    AmericanFootball: AmericanFootball,
    CanoeingKayaking: CanoeingKayaking,
    Gymnastics: Gymnastics,
    Sailing: Sailing,
    TableTennis: TableTennis,
    Archery: Archery,
    Cricket: Cricket,
    IceHockey: IceHockey,
    Skateboarding: Skateboarding,
    Tennis: Tennis,
    Badminton: Badminton,
    Cycling: Cycling,
    MartialArts: MartialArts,
    Skiing: Skiing,
    TrackAndField: TrackAndField,
    Baseball: Baseball,
    Equestrian: Equestrian,
    MountainBiking: MountainBiking,
    Snowboarding: Snowboarding,
    Volleyball: Volleyball,
    Basketball: Basketball,
    Fencing: Fencing,
    RockClimbing: RockClimbing,
    Soccer: Soccer,
    Wrestling: Wrestling,
    Bowling: Bowling,
    FieldHockey: FieldHockey,
    RollerSkating: RollerSkating,
    Surfing: Surfing,
    Boxing: Boxing,
    Golf: Golf,
    Rugby: Rugby,
    Swimming: Swimming,

    SendMessage: SendMessage,
    ParticipantRequest: ParticipantRequest,
    ParticipantEdit: ParticipantEdit,
    Camera: Camera,
    QRCode: QRCode,
    OkV: OkV,
    Add: Add,
    Paste: Paste,
    Fitness: Fitness,

    GradientCircle: GradientCircle,
    Subscription: Subscription,

  }[name];

  if (!Icon) {
    console.warn(`Icon with name "${name}" not found`);
    return null;
  }

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
