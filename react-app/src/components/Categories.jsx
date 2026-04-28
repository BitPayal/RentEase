import './Header.css'
import categories from './CategoriesList';

function Categories(props) {

    return (
        <div className="container mt-5 mb-5">
            <h3 className="fw-bold mb-4" style={{ color: '#0f172a' }}>Explore Categories</h3>
            <div className="category-grid">
                {categories.map((item, index) => {
                    const isActive = props.activeCategory === item.name || (!props.activeCategory && item.name === 'All Categories');
                    return (
                        <div 
                            key={index} 
                            onClick={() => props.handleCategory && props.handleCategory(item.name)} 
                            className={`category-card ${isActive ? 'active' : ''}`}
                        >
                            <div className="category-icon">{item.icon}</div>
                            <span className="category-name">{item.name}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Categories;