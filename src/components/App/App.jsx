import { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { fetchData } from 'services/api/pixabayApi';
import { SearchBar } from 'components/SearchBar/SearchBar';
import { ImageGallery } from 'components/ImageGallery/ImageGallery';
import { Button } from 'components/Button/Button';
import { Modal } from 'components/Modal/Modal';
import { Loader } from 'components/Loader/Loader';
import { Container } from './App.styled';

export class App extends Component {
  state = {
    images: [],
    isLoading: false,
    query: '',
    error: null,
    page: 1,
    showModal: false,
    largeImageURL: null,
  };

  componentDidUpdate(prevProps, prevState) {
    const prevQuery = prevState.query;
    const nextQuery = this.state.query;

    if (prevQuery !== nextQuery) {
      this.fetchImages();
    }
  }

  fetchImages = () => {
    const { query, page } = this.state;
    const perPage = 12;

    this.setState({ isLoading: true });

    fetchData(query, page, perPage)
      .then(({ hits, totalHits }) => {
        const totalPages = Math.ceil(totalHits / perPage);

        if (hits.length === 0) {
          return toast.error('Sorry, no images found. Please, try again!');
        }

        if (page === 1) {
          toast.success(`Hooray! We found ${totalHits} images.`);
        }

        if (page === totalPages) {
          toast.info("You've reached the end of search results.");
        }

        this.setState(({ images, page }) => ({
          images: [...images, ...hits],
          page: page + 1,
          total: totalHits,
        }));
      })
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isLoading: false }));
  };

  handleSearch = query => {
    if (query === this.state.query) return;
    this.setState({
      images: [],
      query,
      page: 1,
      error: null,
    });
  };

  toggleModal = largeImageURL => {
    this.setState(({ showModal }) => ({
      showModal: !showModal,
    }));
    this.setState({ largeImageURL: largeImageURL });
  };

  render() {
    const { images, error, isLoading, showModal, largeImageURL, tags, total } =
      this.state;
    const loadImages = images.length !== 0;
    const isLastPage = images.length === total;
    const loadMoreBtn = loadImages && !isLoading && !isLastPage;

    return (
      <Container>
        <SearchBar onSubmit={this.handleSearch} />

        {error && toast.error(error.message)}

        {isLoading && <Loader />}

        {loadImages && (
          <ImageGallery images={images} onClick={this.toggleModal} />
        )}

        {loadMoreBtn && <Button onClick={this.fetchImages}>Load more</Button>}

        {showModal && (
          <Modal onClose={this.toggleModal}>
            <img src={largeImageURL} alt={tags} />
          </Modal>
        )}

        <ToastContainer theme="colored" position="top-right" autoClose={3000} />
      </Container>
    );
  }
}
