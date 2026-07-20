import { queryAEM } from './lib/aem-client';
import CaravanFormClient from '@/app/CaravanFormClient';
import type { CaravanContentResponseData } from '@/app/types/ContentTypes';
import './page.css';

export default async function Home() {
  let caravanData: CaravanContentResponseData | null = null;

  try {
    caravanData = await queryAEM<CaravanContentResponseData>(
      'caravanContentByPath',
      { path: '/content/dam/wknd-shared/caravan-content' }
    );
    console.log('data: 123', caravanData);
  } catch (error) {
    console.error('Error fetching data:', error);
  }


  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <CaravanFormClient caravanData={caravanData} />
      </main>
    </div>
  );
}
