import React, { useState } from 'react';
import { Button, Form } from 'semantic-ui-react';
import { useMutation, gql } from '@apollo/client';

import { useForm } from '../util/hooks';
import { FETCH_POSTS_QUERY } from '../pages/Home';

function PostForm() {
  const { values, onChange, onSubmit } = useForm(createPostCallback, {
    body: ''
  });

  const [errors, setErrors] = useState('');

  // we use the proxy to 
  // 1- get our latest posts from the apollo cache - old posts
  // 2- add our new post at the begining
  // 3- update our chache - and hence will be added automatically to the screen
  const [createPost] = useMutation(CREATE_POST_MUTATION, {
    variables: values,
    update(proxy, result) {
      const oldPosts = proxy.readQuery({  query: FETCH_POSTS_QUERY });
      const newPosts = [result.data.createPost, ...oldPosts.getPosts];
      proxy.writeQuery({ query: FETCH_POSTS_QUERY, data: {getPosts: newPosts} });
      values.body = ''; // reset body
    },
    onError(err) {
      setErrors(err.message);
    },
  });

  function createPostCallback() {
    createPost();
  }

  return (
    <>
      <Form onSubmit={onSubmit}>
        <h2>Create a post:</h2>
        <Form.Field>
          <Form.Input
            placeholder="Hi World!"
            name="body"
            onChange={onChange}
            value={values.body}
            error={errors ? true : false}
          />
          <Button type="submit" color="teal">
            Submit
          </Button>
        </Form.Field>
      </Form>

      {errors && (
        <div className="ui error message" style={{ marginBottom: 20 }} >
          <ul className="list">
            <li>{ errors }</li>
          </ul>
        </div>
      )}
    </>
  );
}

const CREATE_POST_MUTATION = gql`
  mutation createPost($body: String!) {
    createPost(body: $body) {
      id
      body
      createdAt
      username
      likes {
        id
        username
        createdAt
      }
      likeCount
      comments {
        id
        body
        username
        createdAt
      }
      commentCount
    }
  }
`;

export default PostForm;