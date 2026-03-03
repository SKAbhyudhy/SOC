from redis import Redis
from redis.exceptions import RedisError
from app.core.config import settings


class RedisStreamClient:
    def __init__(self) -> None:
        self._client = Redis.from_url(settings.redis_url, decode_responses=True)

    def publish(self, stream: str, payload: dict) -> None:
        try:
            self._client.xadd(stream, payload, maxlen=1000, approximate=True)
        except RedisError:
            return


redis_stream = RedisStreamClient()
