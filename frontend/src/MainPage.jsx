import useAuth from "./hooks/useAuth.jsx";
import {Spin} from "antd"
import PostsList from './components/PostsList.jsx'
import DateRange from './components/DateRange.jsx'
import TagChooser from "./components/TagChooser.jsx";
import InputSearch from "./components/InputSearch.jsx"
import SortSelect from "./components/SortSelect.jsx";
import {useState} from "react";

const MainPage = () => {
    const { isAuthenticated, loading, id } = useAuth();
    const [selectedTags, setSelectedTags] = useState([]);
    const [dateRange, setDateRange] = useState([null, null]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortViewsType, setSortViewsType] = useState(null);


    

    if (loading) {
        return <div>
            <Spin className="full-screen-container content-center" size="large"/>
        </div>;
    }

    return (
        <div className="w-full h-full py-7" style={{background: '#e6e6e6'}}>
            <div className="flex justify-center " style={{position: 'sticky', top: 0, zIndex: 1000}}>
                <div className="grid grid-cols-4 gap-4 content-center items-center shadow-lg" style={{
                    width: '80%',
                    background: '#fffcf2',
                    borderRadius: '15px',
                    borderColor: 'gray',
                    borderStyle: '1px'
                }}>
                    <div className="flex flex-col items-center" style={{userSelect: 'none'}}>
                        <div className="w-10/12 p-2">
                            <TagChooser onTagsChange={setSelectedTags}/>
                        </div>
                    </div>
                    <div className="flex flex-col items-center" style={{userSelect: 'none'}}>
                        <div className="w-10/12 p-2">
                            <DateRange onDateChange={setDateRange}/>
                        </div>
                    </div>
                    <div className="flex flex-col items-center" style={{userSelect: 'none'}}>
                        <div className="w-10/12 p-2">
                            <InputSearch searchQuery={setSearchQuery}/>
                        </div>
                    </div>
                    <div className="flex flex-col items-center" style={{userSelect: 'none'}}>
                        <div className="w-full p-2">
                            <SortSelect onSortChange={setSortViewsType} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center text-3xl font-semibold hover:text-indigo-500 text-black"
                 style={{background: '#e6e6e6', fontFamily: 'Rubik'}}>
                <PostsList selectedTags={selectedTags} dateRange={dateRange} searchQuery={searchQuery} sortViewsType={sortViewsType}/>
            </div>
        </div>
    );
};

export default MainPage;
