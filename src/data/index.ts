import { assets } from "~/assets";
import { ClientProject, PersonalProject } from "./types";

export * from "./types";

export const clientProjects: ClientProject[] = [
  {
    id: "wins",
    name: "Wins",
    url: "https://forms.co/wins",
    media: [
      {
        type: "video",
        src: assets.clientProjects.wins.homeVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.wins.scrollVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.wins.codesInteractionVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.wins.enlistInteractionVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.wins.productScrollVideo,
        width: 638,
        height: 398,
      },
    ],
  },
  {
    id: "awaken",
    name: "Awaken",
    url: "https://4w4k3n.com",
    media: [
      {
        type: "video",
        src: assets.clientProjects.awaken.homeVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.awaken.productInteractionVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.awaken.aboutInteractionVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.awaken.protectedFormInteractionVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.awaken.passwordInteractionVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.awaken.gameOpenVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.awaken.gameStartVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.awaken.gameEndRoomVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.awaken.gameEndVideo,
        width: 638,
        height: 398,
      },
    ],
  },
  {
    id: "amriel",
    name: "Amriel",
    url: "https://amriel.org",
    media: [
      {
        type: "video",
        src: assets.clientProjects.amriel.homeVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.amriel.homeDragInteractionsVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.amriel.shopInteractionsVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.amriel.cartInteractionsVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.amriel.createInteractionsVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.amriel.notesInteractionsVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.amriel.galleryScrollVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.amriel.aboutInteractionsVideo,
        width: 638,
        height: 398,
      },
    ],
  },
  {
    id: "mokk",
    name: "Mokk",
    url: "https://mokk.co",
    media: [
      {
        type: "video",
        src: assets.clientProjects.mokk.homeVideo,
        width: 638,
        height: 398,
      },
    ],
  },
  {
    id: "chalkheads",
    name: "Chalkhead's Playground",
    url: "https://chalkheadsplayground.com",
    media: [
      {
        type: "video",
        src: assets.clientProjects.chalkheads.bootVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.chalkheads.previewInteractionVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.clientProjects.chalkheads.loginInteractionVideo,
        width: 638,
        height: 398,
      },
    ],
  },
  // {
  //   id: "comunal",
  //   name: "Comunal",
  //   url: "https://comunal.nyc",
  //   media: [
  //     {
  //       type: "image",
  //       src: assets.clientProjects.comunal.homeImage,
  //       width: 638,
  //       height: 398,
  //     },
  //     {
  //       type: "image",
  //       src: assets.clientProjects.comunal.menuImage,
  //       width: 638,
  //       height: 398,
  //     },
  //     {
  //       type: "image",
  //       src: assets.clientProjects.comunal.reservationsImage,
  //       width: 638,
  //       height: 398,
  //     },
  //     {
  //       type: "image",
  //       src: assets.clientProjects.comunal.careersImage,
  //       width: 638,
  //       height: 398,
  //     },
  //     {
  //       type: "image",
  //       src: assets.clientProjects.comunal.privacyImage,
  //       width: 638,
  //       height: 398,
  //     },
  //     {
  //       type: "image",
  //       src: assets.clientProjects.comunal.termsImage,
  //       width: 638,
  //       height: 398,
  //     },
  //   ],
  // },
  // {
  //   id: "comunal-members",
  //   name: "Comunal Members",
  //   url: "https://members.comunal.nyc",
  //   media: [
  //     {
  //       type: "video",
  //       src: assets.clientProjects.comunalMembers.homeVideo,
  //       width: 638,
  //       height: 398,
  //     },
  //   ],
  // },
];

export const personalProjects: PersonalProject[] = [
  {
    id: "tinytanks",
    name: "Tiny Tanks",
    url: "https://tinytanks.io",
    media: [
      {
        type: "video",
        src: assets.personalProjects.tinytanks.previewVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.personalProjects.tinytanks.tdmGameplayVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.personalProjects.tinytanks.ltsGameplayVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.personalProjects.tinytanks.kothGameplayVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.personalProjects.tinytanks.spGameplayVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.personalProjects.tinytanks.dmGameplayVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.personalProjects.tinytanks.loginInteractionVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.personalProjects.tinytanks.profileInteractionsVideo,
        width: 638,
        height: 398,
      },
      {
        type: "video",
        src: assets.personalProjects.tinytanks.leaderboardInteractionsVideo,
        width: 638,
        height: 398,
      },
    ],
  },
];
