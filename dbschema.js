let db = {
  users: [
    {
      userId: "muXlxY9tDXO8o6TpeuA1TWL3cAU2",
      email: "meow@gmail.com",
      username: 'binsh',
      createdAt: "2019-07-25T12:48:07.099Z",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/social-app-d3eeb.appspot.com/o/2301354.jpg?alt=media",
      bio: "Hello my name is binsh, nice to meet you",
      website: "https://google.com",
      location: "Johannesburg, South Africa"
    }
  ],
  posts: [
    {
      username: "binsh",
      body: "This is a sample post",
      createdAt: "2019-07-23T14:06:57.113Z",
      likeCount: 5,
      commentCount: 5
    }
  ],
  comments: [
    {
      username: "binsh",
      postId: "brhbf47r74bf",
      body: "You look good mate!!",
      createdAt: "2019-07-25T12:48:07.099Z"
    }
  ]
};

const userDetails = {
  // Redux data
  credentials: {
    userId: "muXlxY9tDXO8o6TpeuA1TWL3cAU2",
    email: "meow@gmail.com",
    username: 'binsh',
    createdAt: "2019-07-25T12:48:07.099Z",
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/social-app-d3eeb.appspot.com/o/2301354.jpg?alt=media",
    bio: "Hello my name is binsh, nice to meet you",
    website: "https://google.com",
    location: "Johannesburg, South Africa"
  },
  likes: {
    username: "binsh",
    postId: "3dJ5qTJvd9Nm1PPxpdd3"
  }
}