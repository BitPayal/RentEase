import { Link, useNavigate } from 'react-router-dom';
import './Header.css'
import categories from './CategoriesList';

function Categories({ setissearch, setsearch }) {

    const navigate = useNavigate();

    const handleAllCategories = () => {
        if (setissearch) {
            setissearch(false); // Reset search state when All Categories is clicked
        }
        if (setsearch) {
            setsearch(''); // Clear the search input
        }
        navigate('/');
    };

    return (
        <div className='cat-container'>
            <div>
                <span className='pr-3 category' onClick={handleAllCategories}>All Categories</span>
                {categories && categories.length > 0 &&
                    categories.map((item, index) => {
                        return (
                            <span onClick={() => navigate('/category/' + item)} key={index} className='category'> {item} </span>
                        )
                    })}
            </div>
        </div>
    )
}


export default Categories;