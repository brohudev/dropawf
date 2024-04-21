import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { IoIosCheckmarkCircleOutline, IoIosCloseCircleOutline } from 'react-icons/io';
import { LuPackageCheck, LuClipboardSignature } from "react-icons/lu";
import { TbTruckDelivery, TbHomeCheck } from "react-icons/tb";



import "../css/Tracking.css"


const TrackingForm = () => {
  const [parcelID, setParcelID] = useState({
    ParcelID: ''
  });

  const [trackingDetails, setTrackingDetails] = useState([]);
  const [currentTracking, setCurrentTracking] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const trackingNumChange = (event) => {
    try{
      const { value } = event.target;
      setParcelID ({
        ParcelID: value
      });
    } catch (error) {
      console.error(error);
    }

    setShowSuccess(false);
    setShowError(false);
  };

  useEffect(() => {
    const fetchTrackingDetails = async () => {
      try {
          const response = await axios.post(process.env.REACT_APP_BASE_URL + '/customer/get-tracking-details', { parcelID: parcelID.ParcelID });
          const data = response.data;

          let leastRecentEventTimeStamp = null;
          data.forEach((item) => {
              const currentEventTimeStamp = new Date(item.EventTimeStamp);
              if (!leastRecentEventTimeStamp || currentEventTimeStamp < leastRecentEventTimeStamp) {
                  leastRecentEventTimeStamp = currentEventTimeStamp;
              }
          });

          const parsedData = data.map((item) => {
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            const date = new Date(item.EventTimeStamp);
            const month = ('0' + (date.getMonth() + 1)).slice(-2);
            const day = ('0' + date.getDate()).slice(-2);
            const year = date.getFullYear();
            const dayOfWeek = daysOfWeek[date.getDay()];
            const formattedDate = `${dayOfWeek}, ${month}/${day}/${year}`;

            const hours = ('0' + (date.getHours() % 12 || 12)).slice(-2);
            const minutes = ('0' + date.getMinutes()).slice(-2);
            const period = date.getHours() < 12 ? 'AM' : 'PM';
            const formattedTime = `${hours}:${minutes} ${period}`;

            const expectedArrivalDate = new Date(leastRecentEventTimeStamp);
            expectedArrivalDate.setDate(expectedArrivalDate.getDate() + 7);
            const expectedArrivalMonth = ('0' + (expectedArrivalDate.getMonth() + 1)).slice(-2);
            const expectedArrivalDay = ('0' + expectedArrivalDate.getDate()).slice(-2);
            const expectedArrivalYear = expectedArrivalDate.getFullYear();
            const formattedExpectedArrivalDate = `${expectedArrivalMonth}/${expectedArrivalDay}/${expectedArrivalYear}`;
  
            const fullAddress = `${item.StreetAddress}, ${item.City}, ${item.State} ${item.ZipCode}`;
            const CityState = `${item.City}, ${item.State}`
  
            return {
              ParcelID: item.ParcelID,
              EventType: item.EventType,
              EventTimeStamp: item.EventTimeStamp,
              ParsedEventTimeStamp: formattedDate,
              FullAddress: fullAddress,
              CityState: CityState,
              ExpectedArrival: formattedExpectedArrivalDate,
              Time: formattedTime
            };
          });

          setTrackingDetails(parsedData);

          if (parsedData.length > 0) {
            setCurrentTracking(parsedData[0]);
          }
      } catch (error) {
          console.error('Error fetching tracking data:', error);
      }
  };

      fetchTrackingDetails();
    }, [parcelID]); 
    

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isTrackingFound = trackingDetails.some(tracking => tracking.ParcelID === parcelID.ParcelID);

    if (!isTrackingFound) {
      setShowError(true);
    } else {
      setCurrentTracking(trackingDetails[0])
      setShowSuccess(true);
    }
  }

  const formatDate = (dateString) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    const dayOfWeek = daysOfWeek[date.getDay()];
    const formattedDate = `${dayOfWeek}, ${('0' + (date.getMonth() + 1)).slice(-2)}/${('0' + date.getDate()).slice(-2)}/${date.getFullYear()}`;
    return formattedDate;
  };

  const getUniqueDates = (trackingDetails) => {
    const uniqueDates = [...new Set(trackingDetails.map(tracking => formatDate(tracking.EventTimeStamp)))];
    return uniqueDates;
  };

  return (
        <div className="entireForm">
          {!showSuccess ? (
            <div className="trackingForm">
              <form onSubmit={handleSubmit}>
                <p style={{ display: 'flex', justifyContent: 'left', fontWeight: 'bold', fontSize: '20px' }}> Track </p>
                <p style={{ display: 'flex', justifyContent: 'left', fontStyle: 'italic' }}> Enter your 36 character tracking number. </p>
                <div style={{display: 'flex', justifyContent: 'left', flexDirection: 'column'}}>
                    <div className="item">
                      <input
                        type="text"
                        placeholder="Tracking Number"
                        name="ParcelID"
                        id="ParcelID"
                        onChange={trackingNumChange}
                        value={parcelID.ParcelID}
                        pattern=".{36}"
                        required
                        style={{width:'700px', padding: '1em'}}
                      />
                    </div>
                    {showError && (
                      <p style={{ color: 'red', paddingTop: '5px', textAlign: 'left' }}> No tracking information found for the provided tracking number.</p>
                    )}

                  <div style={{ display: 'flex', juistifyContent:'left', paddingTop: '20px' }}>
                    <button variant="primary" type="submit">
                      Track
                    </button>
                  </div>
                </div>
              </form>
            </div>
        ) : (
          <div className="trackingScreenForm">
            <div className="trackingScreen"> 
              <div className="trackingHeader">
                <div className="headerMargin"> 
                  <div className="parcel">
                    <p className="parcelLabel"> STATUS </p> 
                  </div>
                  <p className="parcelLabel"> ETA </p>
                </div>
              </div>
              <div className="headerData">
                <div className="dataMargin">
                  <p className="parcelData"> {currentTracking.EventType} </p>
                  <p className="parcelData"> {currentTracking.ExpectedArrival} </p>
                </div>
              </div>

              <div className="trackingArea">
                <div className="trackingBar"> 
                  <div className="orderRecieved">
                    <div className={currentTracking.EventType === 'Received' || currentTracking.EventType === 'In Transit' || currentTracking.EventType === 'Delivered' ? "l-circle-active" : "l-circle"}>
                      {currentTracking.EventType === 'Received' || currentTracking.EventType === 'In Transit' || currentTracking.EventType === 'Delivered'  ? <IoIosCheckmarkCircleOutline /> : <IoIosCloseCircleOutline />}
                    </div>
                  </div>
                    <div className="orderProcessed"> 
                      <div className={currentTracking.EventType === 'In Transit' || currentTracking.EventType === 'Delivered' ? "t-line-active" : "t-line"}>
                        <div className={currentTracking.EventType === 'In Transit' || currentTracking.EventType === 'Delivered' ? "t-circle-active" : "t-circle"}>
                          {currentTracking.EventType === 'In Transit' || currentTracking.EventType === 'Delivered' ? <IoIosCheckmarkCircleOutline /> : <IoIosCloseCircleOutline />}
                        </div>
                      </div>
                    </div>
                    <div className="orderEnRoute">
                      <div className={currentTracking.EventType === 'In Transit' || currentTracking.EventType === 'Delivered' ? "t-line-active" : "t-line"}>
                        <div className={currentTracking.EventType === 'In Transit' || currentTracking.EventType === 'Delivered' ? "t-circle-active" : "t-circle"}>
                          {currentTracking.EventType === 'In Transit' || currentTracking.EventType === 'Delivered' ? <IoIosCheckmarkCircleOutline /> : <IoIosCloseCircleOutline />}
                        </div>
                      </div>
                    </div>
                    <div className="orderDelivered">
                      <div className={currentTracking.EventType === 'Delivered' ? "r-line-active" : "r-line"}>
                        <div className={currentTracking.EventType === 'Delivered' ? "r-circle-active" : "r-circle"}>
                          {currentTracking.EventType === 'Delivered' ? <IoIosCheckmarkCircleOutline /> : <IoIosCloseCircleOutline />}
                        </div>
                      </div>
                    </div>
                  </div>
              </div>

              <div className="trackingStages">
                <div className="recievedStage">
                  <p className="stageIcons"> <LuPackageCheck /> </p>
                  <p> Package <br/> Recieved </p>
                </div>
                <div className="processingStage">
                  <p className="stageIcons"> <LuClipboardSignature /> </p>
                  <p> Package <br/> Processing </p>
                </div>
                <div className="enRouteStage">
                  <p className="stageIcons"> <TbTruckDelivery /> </p>
                  <p> Package <br/> In Transit </p>
                </div>
                <div className="deliveredStage">
                  <p className="stageIcons"> <TbHomeCheck /> </p>
                  <p> Package <br/> Delivered </p>
                </div>
              </div>
            </div>

            <div className="travelHistory">
              <div className="travelHistoryHeader">
                <p className="travelTitle"> TRAVEL HISTORY </p> 
              </div>
              <table className="travelHistoryTable">
                <thead className="travelHistoryTableHeader">
                    {getUniqueDates(trackingDetails).map((date) => (
                      <div className="travelDateHeaders">
                        <tr key={date} className="travelHistoryDates">
                          <th className="travelHistoryRows"> {date} </th>
                          <br /> 
                          <td>
                            <div className="travelHistoryAddresseData">
                              {trackingDetails.map((entry, index) => {
                                if (entry.ParsedEventTimeStamp === date) {
                                  return <div key={index} className="travelHistoryData">
                                    <div className="travelDataTime">
                                      <p> {entry.Time} </p>  
                                    </div>
                                    <div className="travelDataCityState">
                                      <p> {entry.CityState} </p> 
                                    </div>
                                    <div className="travelDataEventType">
                                      <p> {entry.EventType} </p>  
                                    </div>
                                  </div>;
                                }
                              return null; 
                              })}
                            </div>
                          </td>
                        </tr>
                      </div>
                    ))}
                </thead>
              </table>

              <div className="travelHistoryMargin"> </div>
            </div>


          </div>
        )}
    </div>
  );
};

export default TrackingForm;