# Generated by Django 4.2.1 on 2023-05-15 01:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planner', '0004_rename_data_pathjsondata_path_data_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pathjsondata',
            name='end_lat',
            field=models.DecimalField(db_column='end_lat', decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AlterField(
            model_name='pathjsondata',
            name='end_lon',
            field=models.DecimalField(db_column='end_lon', decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AlterField(
            model_name='pathjsondata',
            name='start_lat',
            field=models.DecimalField(db_column='start_lat', decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AlterField(
            model_name='pathjsondata',
            name='start_lon',
            field=models.DecimalField(db_column='start_lon', decimal_places=6, max_digits=9, null=True),
        ),
    ]
