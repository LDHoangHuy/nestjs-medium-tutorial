export class CommentEntity {
  constructor(comment: any) {
    this.comment = {
      id: comment.id,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      body: comment.body,
      author: {
        username: comment.author.username,
        bio: comment.author.bio,
        image: comment.author.image,
        following: false,
      },
    };
  }

  comment: any;
}