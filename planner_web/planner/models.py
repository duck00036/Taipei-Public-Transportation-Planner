from django.db import models
from django.contrib.auth.models import User

class PathJsonData(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    path_data = models.JSONField(db_column='path_data')
    path_type = models.CharField(max_length=50, blank=True, null=True, db_index=True,db_column='path_type')
    path_name = models.CharField(max_length=30, blank=True, null=True, db_index=True,db_column='path_name')
    path_tag = models.CharField(max_length=200, blank=True, null=True, db_index=True,db_column='path_tag')
    date = models.DateField(db_column='date')
    start_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, db_column='start_lat')
    start_lon = models.DecimalField(max_digits=9, decimal_places=6, null=True,  blank=True, db_column='start_lon')
    end_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True,  blank=True,db_column='end_lat')
    end_lon = models.DecimalField(max_digits=9, decimal_places=6, null=True,  blank=True, db_column='end_lon')


    class Meta:
        db_table = 'path_json_data'
        verbose_name = 'Path JSON Data'
        verbose_name_plural = 'Path JSON Data'
